"use client";

import { useRouter } from "next/navigation";
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
  const locales = LOCALE_CONFIG.filter(
    (option) => !availableLocales || availableLocales.includes(option.id),
  );

  if (locales.length <= 1) {
    return null;
  }

  function switchLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    setLocaleCookie(nextLocale);
    router.refresh();
  }

  return (
    <div
      aria-label={dict.languageSwitcher.label}
      className={cn(
        "flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1 shadow-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        floating && "fixed bottom-5 right-5 z-50 shadow-md",
        className,
      )}
      role="group"
    >
      {locales.map((option) => (
        <button
          aria-label={dict.languageSwitcher[option.ariaKey]}
          aria-pressed={locale === option.id}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
            locale === option.id
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          )}
          key={option.id}
          onClick={() => switchLocale(option.id)}
          type="button"
        >
          <span aria-hidden>{option.flag}</span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
