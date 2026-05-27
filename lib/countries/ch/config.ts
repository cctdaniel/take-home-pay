import type { CountryConfig, CurrencyConfig } from "../types";

export const CH_CURRENCY: CurrencyConfig = {
  code: "CHF",
  symbol: "Fr",
  name: "Swiss Franc",
  locale: "de-CH",
};

export const CH_CONFIG: CountryConfig = {
  code: "CH",
  name: "Switzerland",
  region: "Europe",
  currency: CH_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
