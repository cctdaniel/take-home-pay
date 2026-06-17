import type { CountryConfig, CurrencyConfig } from "../types";

export const DO_CURRENCY: CurrencyConfig = {
  code: "DOP",
  symbol: "RD$",
  name: "Dominican Peso",
  locale: "es-DO",
};

export const DO_CONFIG: CountryConfig = {
  code: "DO",
  name: "Dominican Republic",
  region: "North America",
  currency: DO_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
