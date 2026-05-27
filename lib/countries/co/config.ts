import type { CountryConfig } from "../types";

export const CO_CONFIG = {
  code: "CO",
  name: "Colombia",
  region: "Latin America",
  currency: {
    code: "COP",
    symbol: "COP",
    name: "Colombian Peso",
    locale: "es-CO",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
