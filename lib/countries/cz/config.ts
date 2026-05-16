import type { CountryConfig, CurrencyConfig } from "../types";

export const CZ_CURRENCY: CurrencyConfig = {
  code: "CZK",
  symbol: "Kč",
  name: "Czech Koruna",
  locale: "cs-CZ",
};

export const CZ_CONFIG: CountryConfig = {
  code: "CZ",
  name: "Czechia",
  currency: CZ_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
