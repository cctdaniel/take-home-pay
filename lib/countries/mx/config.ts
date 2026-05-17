import type { CountryConfig, CurrencyConfig } from "../types";

export const MX_CURRENCY: CurrencyConfig = {
  code: "MXN",
  symbol: "$",
  name: "Mexican Peso",
  locale: "es-MX",
};

export const MX_CONFIG: CountryConfig = {
  code: "MX",
  name: "Mexico",
  region: "North America",
  currency: MX_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
