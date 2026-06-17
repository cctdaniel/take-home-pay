import type { CountryConfig, CurrencyConfig } from "../types";

export const PE_CURRENCY: CurrencyConfig = {
  code: "PEN",
  symbol: "S/",
  name: "Peruvian Sol",
  locale: "es-PE",
};

export const PE_CONFIG: CountryConfig = {
  code: "PE",
  name: "Peru",
  region: "South America",
  currency: PE_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
