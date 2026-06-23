import type { Locale } from "@/types/dictionary";
import { isMenuLanguage, type MenuLanguage } from "@/lib/locale";
import { pickTranslation } from "@/lib/translations";
import type { TranslationMap } from "@/types/translations";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const UI_LOCALES: Locale[] = ["en", "th", "fa", "ar", "ru"];

export function parseLocale(value: string | undefined | null): Locale {
  if (value && isMenuLanguage(value)) {
    return value;
  }
  return "en";
}

export function resolveMenuLocale(
  cookieLocale: Locale,
  restaurantLanguages: string[] = ["en"],
  uiLanguage?: string | null,
): MenuLanguage {
  const enabled = restaurantLanguages.filter(isMenuLanguage);

  if (enabled.includes(cookieLocale)) {
    return cookieLocale;
  }

  if (uiLanguage && isMenuLanguage(uiLanguage) && enabled.includes(uiLanguage)) {
    return uiLanguage;
  }

  if (enabled.includes("en")) {
    return "en";
  }

  return enabled[0] ?? "en";
}

export function pickLocalizedText(
  locale: MenuLanguage,
  translations: TranslationMap | unknown,
  enabledLanguages: MenuLanguage[] = ["en", "th"],
): string {
  return pickTranslation(translations, locale, enabledLanguages);
}

export function pickLocalizedOptional(
  locale: MenuLanguage,
  translations: TranslationMap | unknown,
  enabledLanguages: MenuLanguage[] = ["en", "th"],
): string | null {
  const value = pickTranslation(translations, locale, enabledLanguages).trim();
  return value || null;
}

export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar" || locale === "fa";
}
