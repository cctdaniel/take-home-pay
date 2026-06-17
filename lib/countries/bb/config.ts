import type { CountryConfig, CurrencyConfig } from "../types";

export const BB_CURRENCY: CurrencyConfig = {
  code: "BBD",
  symbol: "Bds$",
  name: "Barbadian Dollar",
  locale: "en-BB",
};

export const BB_CONFIG: CountryConfig = {
  code: "BB",
  name: "Barbados",
  region: "North America",
  currency: BB_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
