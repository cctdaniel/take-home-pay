import type { CountryConfig } from "../types";

export const ZA_CONFIG = {
  code: "ZA",
  name: "South Africa",
  region: "Africa",
  currency: {
    code: "ZAR",
    symbol: "R",
    name: "South African Rand",
    locale: "en-ZA",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
