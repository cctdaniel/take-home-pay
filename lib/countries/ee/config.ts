import type { CountryConfig } from "../types";

export const EE_CONFIG = {
  code: "EE",
  name: "Estonia",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "EUR",
    name: "Euro",
    locale: "et-EE",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
