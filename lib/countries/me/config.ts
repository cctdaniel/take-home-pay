import type { CountryConfig } from "../types";

export const ME_CONFIG = {
  code: "ME",
  name: "Montenegro",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "EUR",
    name: "Euro",
    locale: "sr-ME",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
