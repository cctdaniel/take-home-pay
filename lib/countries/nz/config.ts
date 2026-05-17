import type { CountryConfig, CurrencyConfig } from "../types";

export const NZ_CURRENCY: CurrencyConfig = {
  code: "NZD",
  symbol: "NZ$",
  name: "New Zealand Dollar",
  locale: "en-NZ",
};

export const NZ_CONFIG: CountryConfig = {
  code: "NZ",
  name: "New Zealand",
  region: "Asia-Pacific",
  currency: NZ_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
