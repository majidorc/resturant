"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  buildGoogleReviewUrl,
  extractGooglePlaceId,
  isGoogleMapsLink,
  isValidGooglePlaceId,
} from "@/lib/google-place-id";
import { cn } from "@/lib/utils";

type GooglePlaceIdFieldProps = {
  initialReviewUrl: string | null;
  labels: {
    placeId: string;
    placeIdHint: string;
    placeIdPlaceholder: string;
    reviewPreview: string;
    resolving: string;
    invalidPlaceId: string;
    resolveFailed: string;
  };
  inputClassName?: string;
};

export function GooglePlaceIdField({
  initialReviewUrl,
  labels,
  inputClassName,
}: GooglePlaceIdFieldProps) {
  const [rawInput, setRawInput] = useState(() => {
    const fromUrl = extractGooglePlaceId(initialReviewUrl ?? "");
    return fromUrl ?? initialReviewUrl ?? "";
  });
  const [resolvedPlaceId, setResolvedPlaceId] = useState<string | null>(() =>
    extractGooglePlaceId(initialReviewUrl ?? ""),
  );
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const resolveRequestId = useRef(0);
  const lastResolvedInput = useRef("");

  const previewUrl = resolvedPlaceId ? buildGoogleReviewUrl(resolvedPlaceId) : "";

  const resolveMapsLink = useCallback(async (value: string) => {
    const local = extractGooglePlaceId(value);
    if (local) {
      setResolvedPlaceId(local);
      setRawInput(local);
      setResolveError(null);
      return;
    }

    if (!isGoogleMapsLink(value)) {
      setResolvedPlaceId(null);
      setResolveError(null);
      return;
    }

    const requestId = ++resolveRequestId.current;
    setResolving(true);
    setResolveError(null);

    try {
      const response = await fetch("/api/resolve-place-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data: { success?: boolean; placeId?: string; error?: string } = await response.json();

      if (requestId !== resolveRequestId.current) {
        return;
      }

      if (data.success && data.placeId) {
        setResolvedPlaceId(data.placeId);
        setRawInput(data.placeId);
        setResolveError(null);
        return;
      }

      setResolvedPlaceId(null);
      setResolveError(data.error ?? labels.resolveFailed);
    } catch {
      if (requestId === resolveRequestId.current) {
        setResolvedPlaceId(null);
        setResolveError(labels.resolveFailed);
      }
    } finally {
      if (requestId === resolveRequestId.current) {
        setResolving(false);
      }
    }
  }, [labels.resolveFailed]);

  useEffect(() => {
    if (!rawInput.trim() || resolvedPlaceId || resolving) {
      return;
    }

    if (!isGoogleMapsLink(rawInput) || lastResolvedInput.current === rawInput) {
      return;
    }

    lastResolvedInput.current = rawInput;
    void resolveMapsLink(rawInput);
  }, [rawInput, resolvedPlaceId, resolving, resolveMapsLink]);

  const showInvalid = useMemo(() => {
    if (!rawInput.trim() || resolving || resolvedPlaceId) {
      return false;
    }
    if (resolveError) {
      return true;
    }
    return !isGoogleMapsLink(rawInput) && !rawInput.trim().startsWith("http");
  }, [rawInput, resolving, resolvedPlaceId, resolveError]);

  function handleChange(value: string) {
    setResolveError(null);
    const extracted = extractGooglePlaceId(value);
    if (extracted) {
      setRawInput(extracted);
      setResolvedPlaceId(extracted);
      return;
    }

    setRawInput(value);
    setResolvedPlaceId(null);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-900" htmlFor="googlePlaceId">
          {labels.placeId}
        </label>
        <p className="mb-2 text-xs text-slate-500">{labels.placeIdHint}</p>
        <div className="relative">
          <Input
            className={cn(
              inputClassName,
              (showInvalid || resolveError) && "border-orange-300 ring-orange-100",
              resolving && "pr-10",
            )}
            id="googlePlaceId"
            name="googlePlaceId"
            onBlur={() => {
              if (isGoogleMapsLink(rawInput) && !resolvedPlaceId) {
                void resolveMapsLink(rawInput);
              }
            }}
            onChange={(event) => handleChange(event.target.value)}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData("text").trim();
              if (!pasted) {
                return;
              }

              event.preventDefault();
              const extracted = extractGooglePlaceId(pasted);
              if (extracted) {
                setRawInput(extracted);
                setResolvedPlaceId(extracted);
                setResolveError(null);
                return;
              }

              lastResolvedInput.current = pasted;
              setRawInput(pasted);
              setResolvedPlaceId(null);
              void resolveMapsLink(pasted);
            }}
            placeholder={labels.placeIdPlaceholder}
            spellCheck={false}
            value={rawInput}
          />
          {resolving ? (
            <Loader2
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400"
            />
          ) : null}
        </div>
        <input name="googleReviewUrl" type="hidden" value={previewUrl} />
      </div>

      {resolving ? (
        <p className="text-sm text-slate-600">{labels.resolving}</p>
      ) : null}

      {resolveError ? (
        <p className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {resolveError}
        </p>
      ) : null}

      {showInvalid && !resolveError ? (
        <p className="text-sm text-orange-800">{labels.invalidPlaceId}</p>
      ) : null}

      {previewUrl && isValidGooglePlaceId(resolvedPlaceId ?? "") ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">
            {labels.reviewPreview}
          </p>
          <p className="mt-1 break-all text-sm text-emerald-950">{previewUrl}</p>
        </div>
      ) : null}
    </div>
  );
}
