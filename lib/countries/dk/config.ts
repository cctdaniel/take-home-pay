import type { CountryConfig, CurrencyConfig } from "../types";

export const DK_CURRENCY: CurrencyConfig = {
  code: "DKK",
  symbol: "kr.",
  name: "Danish krone",
  locale: "da-DK",
};

export const DK_CONFIG: CountryConfig = {
  code: "DK",
  name: "Denmark",
  currency: DK_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  supportsFilingStatus: false,
  supportsRegions: false,
};
