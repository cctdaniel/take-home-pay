import type { CountryConfig } from "../types";

export const AM_CONFIG = {
  code: "AM",
  name: "Armenia",
  region: "Asia-Pacific",
  currency: {
    code: "AMD",
    symbol: "AMD",
    name: "Armenian Dram",
    locale: "hy-AM",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
