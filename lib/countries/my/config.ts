import type { CountryConfig, CurrencyConfig } from "../types";

export const MY_CURRENCY: CurrencyConfig = {
  code: "MYR",
  symbol: "RM",
  name: "Malaysian Ringgit",
  locale: "ms-MY",
};

export const MY_CONFIG: CountryConfig = {
  code: "MY",
  name: "Malaysia",
  currency: MY_CURRENCY,
  taxYear: 2025,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
