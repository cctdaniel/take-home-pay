import type { CountryConfig } from "../types";

export const AD_CONFIG = {
  code: "AD",
  name: "Andorra",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "EUR",
    name: "Euro",
    locale: "ca-AD",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
