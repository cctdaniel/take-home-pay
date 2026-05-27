import type { CountryConfig, CurrencyConfig } from "../types";

export const ZA_CURRENCY: CurrencyConfig = {
  code: "ZAR",
  symbol: "R",
  name: "South African Rand",
  locale: "en-ZA",
};

export const ZA_CONFIG: CountryConfig = {
  code: "ZA",
  name: "South Africa",
  region: "Africa",
  currency: ZA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
