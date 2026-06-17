import type { CountryConfig, CurrencyConfig } from "../types";

export const PY_CURRENCY: CurrencyConfig = {
  code: "PYG",
  symbol: "₲",
  name: "Paraguayan Guaraní",
  locale: "es-PY",
};

export const PY_CONFIG: CountryConfig = {
  code: "PY",
  name: "Paraguay",
  region: "South America",
  currency: PY_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
