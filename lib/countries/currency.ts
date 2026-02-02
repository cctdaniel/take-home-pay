// ============================================================================
// CURRENCY UTILITIES FOR MULTI-COUNTRY SUPPORT
// ============================================================================

import type { CurrencyCode, CurrencyConfig, CountryCode } from "./types";

// Re-export types for convenience
export type { CurrencyCode, CurrencyConfig };

// ============================================================================
// CURRENCY CONFIGURATIONS
// ============================================================================
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  },
  SGD: {
    code: "SGD",
    symbol: "S$",
    name: "Singapore Dollar",
    locale: "en-SG",
  },
  KRW: {
    code: "KRW",
    symbol: "₩",
    name: "South Korean Won",
    locale: "ko-KR",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "nl-NL",
  },
  AUD: {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    locale: "en-AU",
  },
  THB: {
    code: "THB",
    symbol: "฿",
    name: "Thai Baht",
    locale: "th-TH",
  },
  HKD: {
    code: "HKD",
    symbol: "HK$",
    name: "Hong Kong Dollar",
    locale: "en-HK",
  },
  IDR: {
    code: "IDR",
    symbol: "Rp",
    name: "Indonesian Rupiah",
    locale: "id-ID",
  },
  CHF: {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    locale: "de-CH",
  },
};

// ============================================================================
// COUNTRY TO CURRENCY MAPPING
// ============================================================================
export const COUNTRY_CURRENCY: Record<CountryCode, CurrencyCode> = {
  US: "USD",
  SG: "SGD",
  KR: "KRW",
  NL: "EUR",
  AU: "AUD",
  PT: "EUR",
  TH: "THB",
  HK: "HKD",
  ID: "IDR",
  CH: "CHF",
};

// ============================================================================
// CURRENCY FORMATTING FUNCTIONS
// ============================================================================
export function formatCurrency(amount: number, currencyCode: CurrencyCode = "USD"): string {
  const config = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithCents(amount: number, currencyCode: CurrencyCode = "USD"): string {
  const config = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, currencyCode: CurrencyCode = "USD"): string {
  const config = CURRENCIES[currencyCode];
  return new Intl.NumberFormat(config.locale).format(value);
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode].symbol;
}

export function getCurrencyForCountry(countryCode: CountryCode): CurrencyConfig {
  const baseConfig = CURRENCIES[COUNTRY_CURRENCY[countryCode]];
  
  // Return country-specific locale for shared currencies
  if (countryCode === "PT") {
    return { ...baseConfig, locale: "pt-PT" };
  }
  if (countryCode === "NL") {
    return { ...baseConfig, locale: "nl-NL" };
  }
  if (countryCode === "TH") {
    return { ...baseConfig, locale: "th-TH" };
  }
  if (countryCode === "HK") {
    return { ...baseConfig, locale: "en-HK" };
  }
  if (countryCode === "ID") {
    return { ...baseConfig, locale: "id-ID" };
  }
  
  return baseConfig;
}

// ============================================================================
// COMMON FORMATTING FUNCTIONS
// ============================================================================
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseFormattedNumber(value: string, currencyCode: CurrencyCode = "USD"): number {
  const config = CURRENCIES[currencyCode];
  const parts = new Intl.NumberFormat(config.locale).formatToParts(12345.6);
  const group = parts.find((part) => part.type === "group")?.value ?? ",";
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";

  const withoutGroups = value.replace(new RegExp(escapeRegExp(group), "g"), "");
  const normalized = withoutGroups
    .replace(new RegExp(escapeRegExp(decimal), "g"), ".")
    .replace(/[^0-9.-]/g, "");

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}
