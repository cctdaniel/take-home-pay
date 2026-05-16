import type { CountryConfig, CurrencyConfig } from "../types";

export const IS_CURRENCY: CurrencyConfig = {
  code: "ISK",
  symbol: "kr",
  name: "Icelandic króna",
  locale: "is-IS",
};

export const IS_CONFIG: CountryConfig = {
  code: "IS",
  name: "Iceland",
  currency: IS_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  supportsFilingStatus: false,
  supportsRegions: false,
};
