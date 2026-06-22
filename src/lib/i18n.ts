import type { Locale } from "@/types/dictionary";
import type { SupportedLanguage } from "@/lib/locale";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function parseLocale(value: string | undefined | null): Locale {
  return value === "th" ? "th" : "en";
}

export function resolveMenuLocale(
  cookieLocale: Locale,
  restaurantLanguage?: string | null,
): SupportedLanguage {
  if (cookieLocale === "th" || cookieLocale === "en") {
    return cookieLocale;
  }
  return restaurantLanguage === "th" ? "th" : "en";
}

export function pickLocalizedText(
  locale: SupportedLanguage,
  en: string,
  th: string,
): string {
  if (locale === "th" && th.trim()) {
    return th;
  }
  return en;
}

export function pickLocalizedOptional(
  locale: SupportedLanguage,
  en: string | null | undefined,
  th: string | null | undefined,
): string | null {
  const primary = locale === "th" ? th ?? en : en ?? th;
  const value = primary?.trim();
  return value || null;
}
