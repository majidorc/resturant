"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants";

type ImageDropzoneProps = {
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint: string;
  replaceLabel: string;
  uploadingLabel: string;
  dragLabel: string;
  className?: string;
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

export function ImageDropzone({
  value,
  onChange,
  label,
  hint,
  replaceLabel,
  uploadingLabel,
  dragLabel,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;

      if (file.size > MAX_UPLOAD_BYTES) {
        setError("Image exceeds the 5 MB size limit.");
        return;
      }

      setError(null);
      setUploading(true);

      try {
        const url = await uploadFile(file);
        onChange(url);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  return (
    <div className={className}>
      <p className="text-sm font-medium text-zinc-900">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>

      <div
        className={cn(
          "mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-colors",
          dragActive ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50",
          uploading && "pointer-events-none opacity-70",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <div className="flex flex-col items-center gap-3">
            <img
              alt="Uploaded preview"
              className="h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-sm"
              src={value}
            />
            <div className="flex gap-2">
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                <Upload className="h-4 w-4" />
                {replaceLabel}
              </button>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100"
                onClick={() => onChange(null)}
                type="button"
              >
                <X className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            className="flex flex-col items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            ) : (
              <ImagePlus className="h-8 w-8 text-amber-600" />
            )}
            <span className="text-sm font-medium">
              {uploading ? uploadingLabel : dragLabel}
            </span>
          </button>
        )}

        <input
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => void handleFile(event.target.files?.[0])}
          ref={inputRef}
          type="file"
        />
      </div>

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
