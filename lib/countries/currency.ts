// ============================================================================
// CURRENCY UTILITIES FOR MULTI-COUNTRY SUPPORT
// ============================================================================

import {
  COUNTRY_CONFIGS,
  getCountryConfig,
} from "./registry";
import type { CurrencyCode, CurrencyConfig, CountryCode } from "./types";

// Re-export types for convenience
export type { CurrencyCode, CurrencyConfig };

// ============================================================================
// CURRENCY CONFIGURATIONS
// ============================================================================
const BASE_CURRENCIES: Record<string, CurrencyConfig> = {
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
  TWD: {
    code: "TWD",
    symbol: "NT$",
    name: "New Taiwan Dollar",
    locale: "zh-TW",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    locale: "en-GB",
  },
  CHF: {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    locale: "de-CH",
  },
  ILS: {
    code: "ILS",
    symbol: "₪",
    name: "Israeli Shekel",
    locale: "he-IL",
  },
  TRY: {
    code: "TRY",
    symbol: "₺",
    name: "Turkish Lira",
    locale: "tr-TR",
  },
  ZAR: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    locale: "en-ZA",
  },
  ARS: {
    code: "ARS",
    symbol: "$",
    name: "Argentine Peso",
    locale: "es-AR",
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    locale: "pt-BR",
  },
  HUF: {
    code: "HUF",
    symbol: "Ft",
    name: "Hungarian Forint",
    locale: "hu-HU",
  },
  PLN: {
    code: "PLN",
    symbol: "zł",
    name: "Polish Zloty",
    locale: "pl-PL",
  },
  SAR: {
    code: "SAR",
    symbol: "﷼",
    name: "Saudi Riyal",
    locale: "ar-SA",
  },
  QAR: {
    code: "QAR",
    symbol: "QR",
    name: "Qatari Riyal",
    locale: "ar-QA",
  },
};

export const CURRENCIES: Record<string, CurrencyConfig> = {
  ...BASE_CURRENCIES,
  ...Object.fromEntries(
    Object.values(COUNTRY_CONFIGS).map(({ currency }) => [
      currency.code,
      currency,
    ]),
  ),
};

function getCurrencyConfig(currencyCode: CurrencyCode): CurrencyConfig {
  return (
    CURRENCIES[currencyCode] ?? {
      code: currencyCode,
      symbol: currencyCode,
      name: currencyCode,
      locale: "en-US",
    }
  );
}

// ============================================================================
// CURRENCY FORMATTING FUNCTIONS
// ============================================================================
export function formatCurrency(amount: number, currencyCode: CurrencyCode = "USD"): string {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyWithCents(amount: number, currencyCode: CurrencyCode = "USD"): string {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyWithCode(amount: number, currencyCode: CurrencyCode = "USD"): string {
  return `${currencyCode} ${formatNumber(amount, currencyCode)}`;
}

export function formatCurrencyWithCodeAndCents(amount: number, currencyCode: CurrencyCode = "USD"): string {
  const config = getCurrencyConfig(currencyCode);
  const formattedAmount = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${currencyCode} ${formattedAmount}`;
}

export function formatNumber(value: number, currencyCode: CurrencyCode = "USD"): string {
  const config = getCurrencyConfig(currencyCode);
  return new Intl.NumberFormat(config.locale).format(value);
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return getCurrencyConfig(currencyCode).symbol;
}

export function getCurrencyForCountry(countryCode: CountryCode): CurrencyConfig {
  return getCountryConfig(countryCode).currency;
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
  const config = getCurrencyConfig(currencyCode);
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
