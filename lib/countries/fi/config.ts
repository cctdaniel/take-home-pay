import type { CountryConfig, CurrencyConfig } from "../types";

export const FI_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "fi-FI",
};

export const FI_CONFIG: CountryConfig = {
  code: "FI",
  name: "Finland",
  region: "Europe",
  currency: FI_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  supportsFilingStatus: false,
  supportsRegions: false,
};
