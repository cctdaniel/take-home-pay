import type { CountryConfig } from "../types";

export const RO_CONFIG = {
  code: "RO",
  name: "Romania",
  region: "Europe",
  currency: {
    code: "RON",
    symbol: "lei",
    name: "Romanian Leu",
    locale: "ro-RO",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
