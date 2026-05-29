import type { CountryConfig, CurrencyConfig } from "../types";

export const LU_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "fr-LU",
};

export const LU_CONFIG: CountryConfig = {
  code: "LU",
  name: "Luxembourg",
  region: "Europe",
  currency: LU_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
