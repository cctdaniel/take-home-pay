import type { CountryConfig, CurrencyConfig } from "../types";

export const MA_CURRENCY: CurrencyConfig = {
  code: "MAD",
  symbol: "MAD",
  name: "Moroccan Dirham",
  locale: "fr-MA",
};

export const MA_CONFIG: CountryConfig = {
  code: "MA",
  name: "Morocco",
  region: "Africa",
  currency: MA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
