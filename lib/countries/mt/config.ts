import type { CountryConfig, CurrencyConfig } from "../types";

export const MT_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "EUR",
  name: "Euro",
  locale: "en-MT",
};

export const MT_CONFIG: CountryConfig = {
  code: "MT",
  name: "Malta",
  currency: MT_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  supportsFilingStatus: true,
  supportsRegions: false,
};
