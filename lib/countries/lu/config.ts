import type { CountryConfig } from "../types";

export const LU_CONFIG = {
  code: "LU",
  name: "Luxembourg",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "EUR",
    name: "Euro",
    locale: "lb-LU",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-26",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
