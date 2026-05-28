import type { CountryConfig, CurrencyConfig } from "../types";

export const AR_CURRENCY: CurrencyConfig = {
  code: "ARS",
  symbol: "$",
  name: "Argentine Peso",
  locale: "es-AR",
};

export const AR_CONFIG: CountryConfig = {
  code: "AR",
  name: "Argentina",
  region: "South America",
  currency: AR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
