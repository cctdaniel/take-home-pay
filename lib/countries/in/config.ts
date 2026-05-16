import type { CountryConfig, CurrencyConfig } from "../types";

export const IN_CURRENCY: CurrencyConfig = {
  code: "INR",
  symbol: "\u20B9",
  name: "Indian Rupee",
  locale: "en-IN",
};

export const IN_CONFIG: CountryConfig = {
  code: "IN",
  name: "India",
  currency: IN_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
