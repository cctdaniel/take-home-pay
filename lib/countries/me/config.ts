import type { CountryConfig, CurrencyConfig } from "../types";

export const ME_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "sr-ME",
};

export const ME_CONFIG: CountryConfig = {
  code: "ME",
  name: "Montenegro",
  region: "Europe",
  currency: ME_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
