import type { CountryConfig } from "../types";

export const LK_CONFIG = {
  code: "LK",
  name: "Sri Lanka",
  region: "Asia-Pacific",
  currency: {
    code: "LKR",
    symbol: "Rs",
    name: "Sri Lankan Rupee",
    locale: "si-LK",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
