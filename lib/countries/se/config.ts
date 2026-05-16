import type { CountryConfig, CurrencyConfig } from "../types";

export const SE_CURRENCY: CurrencyConfig = {
  code: "SEK",
  symbol: "kr",
  name: "Swedish krona",
  locale: "sv-SE",
};

export const SE_CONFIG: CountryConfig = {
  code: "SE",
  name: "Sweden",
  currency: SE_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  supportsFilingStatus: false,
  supportsRegions: false,
};
