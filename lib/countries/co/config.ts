import type { CountryConfig, CurrencyConfig } from "../types";

export const CO_CURRENCY: CurrencyConfig = {
  code: "COP",
  symbol: "$",
  name: "Colombian Peso",
  locale: "es-CO",
};

export const CO_CONFIG: CountryConfig = {
  code: "CO",
  name: "Colombia",
  region: "South America",
  currency: CO_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
