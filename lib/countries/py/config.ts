import type { CountryConfig } from "../types";

export const PY_CONFIG = {
  code: "PY",
  name: "Paraguay",
  region: "Latin America",
  currency: {
    code: "PYG",
    symbol: "Gs",
    name: "Paraguayan Guarani",
    locale: "es-PY",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
