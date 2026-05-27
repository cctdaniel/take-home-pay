import type { CountryConfig, CurrencyConfig } from "../types";

export const SA_CURRENCY: CurrencyConfig = {
  code: "SAR",
  symbol: "SR",
  name: "Saudi Riyal",
  locale: "ar-SA",
};

export const SA_CONFIG: CountryConfig = {
  code: "SA",
  name: "Saudi Arabia",
  region: "Middle East",
  currency: SA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
