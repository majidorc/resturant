export const SUPPORTED_CURRENCIES = ["USD", "THB", "EUR", "GBP"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const SUPPORTED_LANGUAGES = ["en", "th"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const CURRENCY_OPTIONS: { value: SupportedCurrency; label: string }[] = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "THB", label: "Thai Baht (THB)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
];

export const LANGUAGE_OPTIONS: { value: SupportedLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "th", label: "Thai" },
];

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

export function formatMenuPrice(
  price: number,
  currency: string,
  language: string,
): string {
  try {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}
