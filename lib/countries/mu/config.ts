import type { CountryConfig } from "../types";

export const MU_CONFIG = {
  code: "MU",
  name: "Mauritius",
  region: "Africa",
  currency: {
    code: "MUR",
    symbol: "Rs",
    name: "Mauritian Rupee",
    locale: "en-MU",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
