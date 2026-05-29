import type { CountryConfig, CurrencyConfig } from "../types";

export const SK_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "sk-SK",
};

export const SK_CONFIG: CountryConfig = {
  code: "SK",
  name: "Slovakia",
  region: "Europe",
  currency: SK_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
