import type { CountryConfig } from "../types";

export const CH_CONFIG = {
  code: "CH",
  name: "Switzerland",
  region: "Europe",
  currency: {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    locale: "de-CH",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
