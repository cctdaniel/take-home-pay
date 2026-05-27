import type { CountryConfig } from "../types";

export const KE_CONFIG = {
  code: "KE",
  name: "Kenya",
  region: "Africa",
  currency: {
    code: "KES",
    symbol: "KSh",
    name: "Kenyan Shilling",
    locale: "en-KE",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
