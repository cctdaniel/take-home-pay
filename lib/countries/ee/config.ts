import type { CountryConfig, CurrencyConfig } from "../types";

export const EE_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "et-EE",
};

export const EE_CONFIG: CountryConfig = {
  code: "EE",
  name: "Estonia",
  region: "Europe",
  currency: EE_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
