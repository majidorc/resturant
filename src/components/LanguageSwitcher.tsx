"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/types/dictionary";
import { useLocale } from "@/components/LocaleProvider";

type LanguageSwitcherProps = {
  className?: string;
  floating?: boolean;
  availableLocales?: Locale[];
};

const LOCALE_CONFIG: { id: Locale; flag: string; label: string; ariaKey: keyof typeof ariaLabels }[] = [
  { id: "en", flag: "🇺🇸", label: "EN", ariaKey: "english" },
  { id: "th", flag: "🇹🇭", label: "TH", ariaKey: "thai" },
  { id: "fa", flag: "🇮🇷", label: "FA", ariaKey: "persian" },
  { id: "ar", flag: "🇸🇦", label: "AR", ariaKey: "arabic" },
  { id: "ru", flag: "🇷🇺", label: "RU", ariaKey: "russian" },
];

const ariaLabels = {
  english: "english",
  thai: "thai",
  persian: "persian",
  arabic: "arabic",
  russian: "russian",
} as const;

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageSwitcher({
  className,
  floating = false,
  availableLocales,
}: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, dict } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const locales = LOCALE_CONFIG.filter(
    (option) => !availableLocales || availableLocales.includes(option.id),
  );
  const activeOption = locales.find((option) => option.id === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (locales.length <= 1 || !activeOption) {
    return null;
  }

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }
    setLocaleCookie(nextLocale);
    setOpen(false);
    router.refresh();
  }

  return (
    <div
      className={cn("relative", floating && "fixed bottom-5 right-5 z-50", className)}
      ref={rootRef}
    >
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={dict.languageSwitcher.label}
        className={cn(
          "flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200",
          "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
          open && "border-slate-300 bg-slate-50 shadow-md",
        )}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Globe className="h-4 w-4 text-slate-500" aria-hidden />
        <span aria-hidden>{activeOption.flag}</span>
        <span>{activeOption.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          role="listbox"
        >
          {locales.map((option) => {
            const isActive = option.id === locale;
            return (
              <button
                aria-label={dict.languageSwitcher[option.ariaKey]}
                aria-selected={isActive}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                )}
                key={option.id}
                onClick={() => switchLocale(option.id)}
                role="option"
                type="button"
              >
                <span className="flex items-center gap-2.5">
                  <span aria-hidden>{option.flag}</span>
                  <span className="font-medium">{option.label}</span>
                </span>
                {isActive && <Check className="h-4 w-4 shrink-0" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
