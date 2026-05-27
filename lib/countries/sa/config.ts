import type { CountryConfig } from "../types";

export const SA_CONFIG = {
  code: "SA",
  name: "Saudi Arabia",
  region: "Middle East",
  currency: {
    code: "SAR",
    symbol: "SR",
    name: "Saudi Riyal",
    locale: "en-SA",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-26",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
