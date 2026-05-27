import type { CountryConfig } from "../types";

export const RW_CONFIG = {
  code: "RW",
  name: "Rwanda",
  region: "Africa",
  currency: {
    code: "RWF",
    symbol: "RWF",
    name: "Rwandan Franc",
    locale: "rw-RW",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
