import type { CountryConfig, CurrencyConfig } from "../types";

export const SI_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "sl-SI",
};

export const SI_CONFIG: CountryConfig = {
  code: "SI",
  name: "Slovenia",
  region: "Europe",
  currency: SI_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
