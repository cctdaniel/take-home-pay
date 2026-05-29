import type { CountryConfig, CurrencyConfig } from "../types";

export const LT_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "lt-LT",
};

export const LT_CONFIG: CountryConfig = {
  code: "LT",
  name: "Lithuania",
  region: "Europe",
  currency: LT_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
