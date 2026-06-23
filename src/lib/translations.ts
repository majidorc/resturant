import type { MenuLanguage } from "@/lib/locale";
import { isMenuLanguage } from "@/lib/locale";
import type { TranslationMap } from "@/types/translations";

export function parseTranslationMap(value: unknown): TranslationMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const result: TranslationMap = {};
  for (const [key, text] of Object.entries(value)) {
    if (isMenuLanguage(key) && typeof text === "string" && text.trim()) {
      result[key] = text.trim();
    }
  }
  return result;
}

export function pickTranslation(
  value: unknown,
  locale: MenuLanguage,
  enabledLanguages: MenuLanguage[] = ["en"],
): string {
  const map = parseTranslationMap(value);
  const fallbackOrder = [
    locale,
    ...enabledLanguages.filter((language) => language !== locale),
    "en" as MenuLanguage,
  ];

  for (const language of fallbackOrder) {
    const text = map[language];
    if (text?.trim()) {
      return text;
    }
  }

  return Object.values(map).find((text) => text?.trim()) ?? "";
}

export function extractTranslationsFromFormData(
  formData: FormData,
  prefix: string,
  languages: MenuLanguage[],
): TranslationMap {
  const result: TranslationMap = {};
  for (const language of languages) {
    const value = formData.get(`${prefix}_${language}`)?.toString().trim();
    if (value) {
      result[language] = value;
    }
  }
  return result;
}

export function hasRequiredTranslations(
  map: TranslationMap,
  languages: MenuLanguage[],
): boolean {
  return languages.every((language) => Boolean(map[language]?.trim()));
}

export function toPrismaJson(map: TranslationMap): TranslationMap {
  return { ...map };
}

export function asTranslationField(value: unknown): TranslationMap {
  return parseTranslationMap(value);
}

export function formatTranslationPreview(
  value: unknown,
  languages: MenuLanguage[],
): string {
  return languages
    .map((language) => pickTranslation(value, language, languages))
    .filter(Boolean)
    .join(" / ");
}
