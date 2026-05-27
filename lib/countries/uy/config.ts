import type { CountryConfig } from "../types";

export const UY_CONFIG = {
  code: "UY",
  name: "Uruguay",
  region: "Latin America",
  currency: {
    code: "UYU",
    symbol: "$U",
    name: "Uruguayan Peso",
    locale: "es-UY",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
