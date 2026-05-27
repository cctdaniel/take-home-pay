import type { CountryConfig } from "../types";

export const GT_CONFIG = {
  code: "GT",
  name: "Guatemala",
  region: "Latin America",
  currency: {
    code: "GTQ",
    symbol: "Q",
    name: "Guatemalan Quetzal",
    locale: "es-GT",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
