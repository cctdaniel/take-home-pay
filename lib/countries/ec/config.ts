import type { CountryConfig, CurrencyConfig } from "../types";

export const EC_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  locale: "es-EC",
};

export const EC_CONFIG: CountryConfig = {
  code: "EC",
  name: "Ecuador",
  region: "South America",
  currency: EC_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
