"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useDictionary } from "@/components/LocaleProvider";

type ImageLightboxProps = {
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

export function ImageLightbox({ imageUrl, alt, onClose }: ImageLightboxProps) {
  const dict = useDictionary();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <button
        aria-label={dict.publicMenu.closeLightbox}
        className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        type="button"
      >
        <X className="h-5 w-5" />
      </button>

      <img
        alt={alt}
        className="max-h-[85vh] w-full max-w-xl rounded-2xl object-contain shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        src={imageUrl}
      />
    </div>
  );
}
