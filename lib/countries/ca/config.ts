import type { CountryConfig, CurrencyConfig } from "../types";

export const CA_CURRENCY: CurrencyConfig = {
  code: "CAD",
  symbol: "$",
  name: "Canadian Dollar",
  locale: "en-CA",
};

export const CA_CONFIG: CountryConfig = {
  code: "CA",
  name: "Canada",
  region: "North America",
  currency: CA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: "ON",
  supportsFilingStatus: false,
  supportsRegions: true,
};
