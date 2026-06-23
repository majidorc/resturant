"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_DISH_IMAGES, MAX_UPLOAD_BYTES } from "@/lib/upload-constants";

type MultiImageDropzoneProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  label: string;
  hint: string;
  uploadingLabel: string;
  dragLabel: string;
  removeLabel: string;
  maxReachedLabel: string;
};

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const payload: { success?: boolean; url?: string; error?: string } = await response.json();

  if (!response.ok || !payload.success || !payload.url) {
    throw new Error(payload.error ?? "Upload failed.");
  }

  return payload.url;
}

export function MultiImageDropzone({
  value,
  onChange,
  label,
  hint,
  uploadingLabel,
  dragLabel,
  removeLabel,
  maxReachedLabel,
}: MultiImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const atLimit = value.length >= MAX_DISH_IMAGES;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList = Array.from(files);
      const remainingSlots = MAX_DISH_IMAGES - value.length;

      if (remainingSlots <= 0) {
        setError(maxReachedLabel);
        return;
      }

      const batch = fileList.slice(0, remainingSlots);

      if (fileList.length > remainingSlots) {
        setError(maxReachedLabel);
      } else {
        setError(null);
      }

      setUploading(true);

      try {
        const uploaded: string[] = [];

        for (const file of batch) {
          if (file.size > MAX_UPLOAD_BYTES) {
            throw new Error("One or more images exceed the 5 MB size limit.");
          }
          uploaded.push(await uploadFile(file));
        }

        onChange([...value, ...uploaded].slice(0, MAX_DISH_IMAGES));
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [maxReachedLabel, onChange, value],
  );

  function removeImage(url: string) {
    onChange(value.filter((entry) => entry !== url));
    setError(null);
  }

  return (
    <div>
      <p className="text-sm font-medium text-zinc-900">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {value.map((url) => (
            <div className="relative" key={url}>
              <img
                alt="Dish preview"
                className="h-20 w-20 rounded-xl border border-slate-200 object-cover shadow-sm"
                src={url}
              />
              <button
                aria-label={removeLabel}
                className="absolute -right-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-rose-200 bg-rose-600 text-white shadow-sm transition-colors hover:bg-rose-700"
                onClick={() => removeImage(url)}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          "mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 transition-colors",
          dragActive ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50",
          (uploading || atLimit) && "pointer-events-none opacity-70",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!atLimit) setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          if (!atLimit) void handleFiles(event.dataTransfer.files);
        }}
      >
        <button
          className="flex flex-col items-center gap-2 text-slate-600 transition-colors hover:text-slate-900 disabled:cursor-not-allowed"
          disabled={atLimit}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
          ) : (
            <ImagePlus className="h-7 w-7 text-amber-600" />
          )}
          <span className="text-sm font-medium">
            {uploading ? uploadingLabel : atLimit ? maxReachedLabel : dragLabel}
          </span>
        </button>

        <input
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          multiple
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
            event.target.value = "";
          }}
          ref={inputRef}
          type="file"
        />
      </div>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
