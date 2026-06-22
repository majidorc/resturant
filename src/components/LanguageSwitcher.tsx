"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LOCALE_COOKIE } from "@/lib/i18n";
import type { Locale } from "@/types/dictionary";
import { useLocale } from "@/components/LocaleProvider";

type LanguageSwitcherProps = {
  className?: string;
  floating?: boolean;
};

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

export function LanguageSwitcher({ className, floating = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, dict } = useLocale();

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    setLocaleCookie(nextLocale);
    router.refresh();
  }

  return (
    <div
      aria-label={dict.languageSwitcher.label}
      className={cn(
        "flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm",
        floating && "fixed bottom-5 right-5 z-50 shadow-md",
        className,
      )}
      role="group"
    >
      <button
        aria-label={dict.languageSwitcher.english}
        aria-pressed={locale === "en"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
          locale === "en"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
        onClick={() => switchLocale("en")}
        type="button"
      >
        <span aria-hidden>🇺🇸</span>
        <span>EN</span>
      </button>
      <button
        aria-label={dict.languageSwitcher.thai}
        aria-pressed={locale === "th"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
          locale === "th"
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
        onClick={() => switchLocale("th")}
        type="button"
      >
        <span aria-hidden>🇹🇭</span>
        <span>TH</span>
      </button>
    </div>
  );
}
