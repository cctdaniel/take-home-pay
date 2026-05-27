import type { CountryConfig } from "../types";

export const PE_CONFIG = {
  code: "PE",
  name: "Peru",
  region: "Latin America",
  currency: {
    code: "PEN",
    symbol: "S/",
    name: "Peruvian Sol",
    locale: "es-PE",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
