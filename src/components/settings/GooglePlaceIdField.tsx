"use client";

import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  GOOGLE_PLACE_ID_FINDER_URL,
  buildGoogleReviewUrl,
  extractGooglePlaceId,
  isValidGooglePlaceId,
} from "@/lib/google-place-id";
import { cn } from "@/lib/utils";

type GooglePlaceIdFieldProps = {
  initialReviewUrl: string | null;
  labels: {
    placeId: string;
    placeIdHint: string;
    placeIdPlaceholder: string;
    findPlaceId: string;
    reviewPreview: string;
    invalidPlaceId: string;
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

  const resolvedPlaceId = useMemo(() => extractGooglePlaceId(rawInput), [rawInput]);
  const previewUrl = resolvedPlaceId ? buildGoogleReviewUrl(resolvedPlaceId) : "";
  const showInvalid =
    rawInput.trim().length > 0 && !resolvedPlaceId && !rawInput.trim().startsWith("http");

  function handleChange(value: string) {
    const extracted = extractGooglePlaceId(value);
    setRawInput(extracted ?? value);
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="block text-sm font-medium text-zinc-900" htmlFor="googlePlaceId">
              {labels.placeId}
            </label>
            <p className="mt-0.5 text-xs text-slate-500">{labels.placeIdHint}</p>
          </div>
          <a
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-sm transition-all duration-200 hover:bg-slate-50"
            href={GOOGLE_PLACE_ID_FINDER_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
            {labels.findPlaceId}
          </a>
        </div>
        <Input
          className={cn(inputClassName, showInvalid && "border-orange-300 ring-orange-100")}
          id="googlePlaceId"
          name="googlePlaceId"
          onChange={(event) => handleChange(event.target.value)}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData("text");
            const extracted = extractGooglePlaceId(pasted);
            if (extracted) {
              event.preventDefault();
              setRawInput(extracted);
            }
          }}
          placeholder={labels.placeIdPlaceholder}
          spellCheck={false}
          value={rawInput}
        />
        <input name="googleReviewUrl" type="hidden" value={previewUrl} />
      </div>

      {showInvalid ? (
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
