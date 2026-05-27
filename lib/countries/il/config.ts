import type { CountryConfig } from "../types";

export const IL_CONFIG = {
  code: "IL",
  name: "Israel",
  region: "Middle East",
  currency: {
    code: "ILS",
    symbol: "ILS",
    name: "Israeli New Shekel",
    locale: "he-IL",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
