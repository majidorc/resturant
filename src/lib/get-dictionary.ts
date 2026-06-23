import en from "@/dictionaries/en.json";
import th from "@/dictionaries/th.json";
import fa from "@/dictionaries/fa.json";
import ar from "@/dictionaries/ar.json";
import ru from "@/dictionaries/ru.json";
import type { Dictionary, Locale } from "@/types/dictionary";

const dictionaries: Record<Locale, Dictionary> = { en, th, fa, ar, ru };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}
