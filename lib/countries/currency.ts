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
};

// ============================================================================
// COUNTRY TO CURRENCY MAPPING
// ============================================================================
export const COUNTRY_CURRENCY: Record<CountryCode, CurrencyCode> = {
  US: "USD",
  SG: "SGD",
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
  return CURRENCIES[COUNTRY_CURRENCY[countryCode]];
}

// ============================================================================
// COMMON FORMATTING FUNCTIONS
// ============================================================================
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function parseFormattedNumber(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
