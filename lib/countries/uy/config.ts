import type { CountryConfig, CurrencyConfig } from "../types";

export const UY_CURRENCY: CurrencyConfig = {
  code: "UYU",
  symbol: "$",
  name: "Uruguayan Peso",
  locale: "es-UY",
};

export const UY_CONFIG: CountryConfig = {
  code: "UY",
  name: "Uruguay",
  region: "South America",
  currency: UY_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
