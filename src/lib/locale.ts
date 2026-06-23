export const SUPPORTED_CURRENCIES = ["USD", "THB", "IRT", "SAR", "RUB"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const MENU_LANGUAGES = ["en", "th", "fa", "ar", "ru"] as const;
export type MenuLanguage = (typeof MENU_LANGUAGES)[number];

export const SUPPORTED_LANGUAGES = MENU_LANGUAGES;
export type SupportedLanguage = MenuLanguage;

export const CURRENCY_OPTIONS: { value: SupportedCurrency; label: string }[] = [
  { value: "USD", label: "US Dollar (USD, $)" },
  { value: "THB", label: "Thai Baht (THB, ฿)" },
  { value: "IRT", label: "Iranian Toman (IRT, تومان)" },
  { value: "SAR", label: "Saudi Rial (SAR, ر.س)" },
  { value: "RUB", label: "Russian Ruble (RUB, ₽)" },
];

export const MENU_LANGUAGE_OPTIONS: {
  value: MenuLanguage;
  label: string;
  nativeLabel: string;
}[] = [
  { value: "en", label: "English", nativeLabel: "English" },
  { value: "th", label: "Thai", nativeLabel: "ไทย" },
  { value: "fa", label: "Persian", nativeLabel: "فارسی" },
  { value: "ar", label: "Arabic", nativeLabel: "العربية" },
  { value: "ru", label: "Russian", nativeLabel: "Русский" },
];

export const LANGUAGE_OPTIONS = MENU_LANGUAGE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(value as SupportedCurrency);
}

export function isMenuLanguage(value: string): value is MenuLanguage {
  return MENU_LANGUAGES.includes(value as MenuLanguage);
}

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return isMenuLanguage(value);
}

export function parseMenuLanguages(values: string[]): MenuLanguage[] {
  const unique = new Set<MenuLanguage>();
  for (const value of values) {
    if (isMenuLanguage(value)) {
      unique.add(value);
    }
  }
  return unique.size > 0 ? [...unique] : ["en"];
}

export function getMenuLanguageLabel(language: MenuLanguage): string {
  return MENU_LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? language;
}

const CURRENCY_INTL_LOCALE: Record<SupportedCurrency, string> = {
  USD: "en-US",
  THB: "th-TH",
  IRT: "fa-IR",
  SAR: "ar-SA",
  RUB: "ru-RU",
};

function formatCustomCurrency(price: number, currency: SupportedCurrency): string | null {
  if (currency === "IRT") {
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price)} تومان`;
  }

  if (currency === "SAR") {
    return `${new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 2 }).format(price)} ر.س`;
  }

  if (currency === "RUB") {
    try {
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${price.toFixed(2)} ₽`;
    }
  }

  return null;
}

export function formatMenuPrice(
  price: number,
  currency: string,
  language: string,
): string {
  if (isSupportedCurrency(currency)) {
    const custom = formatCustomCurrency(price, currency);
    if (custom) {
      return custom;
    }

    try {
      return new Intl.NumberFormat(CURRENCY_INTL_LOCALE[currency] ?? language, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${price.toFixed(2)} ${currency}`;
    }
  }

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
