import type { CountryConfig, CurrencyConfig } from "../types";

export const PA_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  locale: "es-PA",
};

export const PA_CONFIG: CountryConfig = {
  code: "PA",
  name: "Panama",
  region: "South America",
  currency: PA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
