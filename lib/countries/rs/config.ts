import type { CountryConfig } from "../types";

export const RS_CONFIG = {
  code: "RS",
  name: "Serbia",
  region: "Europe",
  currency: {
    code: "RSD",
    symbol: "RSD",
    name: "Serbian Dinar",
    locale: "sr-RS",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
