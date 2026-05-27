import type { CountryConfig } from "../types";

export const BM_CONFIG = {
  code: "BM",
  name: "Bermuda",
  region: "Caribbean",
  currency: {
    code: "BMD",
    symbol: "BD$",
    name: "Bermudian Dollar",
    locale: "en-BM",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
