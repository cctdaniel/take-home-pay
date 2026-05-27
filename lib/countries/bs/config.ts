import type { CountryConfig } from "../types";

export const BS_CONFIG = {
  code: "BS",
  name: "Bahamas",
  region: "Caribbean",
  currency: {
    code: "BSD",
    symbol: "B$",
    name: "Bahamian Dollar",
    locale: "en-BS",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
