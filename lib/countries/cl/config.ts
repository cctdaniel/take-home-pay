import type { CountryConfig, CurrencyConfig } from "../types";

export const CL_CURRENCY: CurrencyConfig = {
  code: "CLP",
  symbol: "$",
  name: "Chilean Peso",
  locale: "es-CL",
};

export const CL_CONFIG: CountryConfig = {
  code: "CL",
  name: "Chile",
  region: "South America",
  currency: CL_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
