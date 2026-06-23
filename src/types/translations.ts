import type { MenuLanguage } from "@/lib/locale";

export type TranslationMap = Partial<Record<MenuLanguage, string>>;

export type JsonTranslationField = TranslationMap;
