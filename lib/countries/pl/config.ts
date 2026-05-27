import type { CountryConfig } from "../types";

export const PL_CONFIG = {
  code: "PL",
  name: "Poland",
  region: "Europe",
  currency: {
    code: "PLN",
    symbol: "zł",
    name: "Polish Zloty",
    locale: "pl-PL",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
