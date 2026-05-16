import type { CountryConfig, CurrencyConfig } from "../types";

export const NO_CURRENCY: CurrencyConfig = {
  code: "NOK",
  symbol: "kr",
  name: "Norwegian krone",
  locale: "nb-NO",
};

export const NO_CONFIG: CountryConfig = {
  code: "NO",
  name: "Norway",
  currency: NO_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  supportsFilingStatus: false,
  supportsRegions: false,
};
