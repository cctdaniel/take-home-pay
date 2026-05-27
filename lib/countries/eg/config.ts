import type { CountryConfig } from "../types";

export const EG_CONFIG = {
  code: "EG",
  name: "Egypt",
  region: "Africa",
  currency: {
    code: "EGP",
    symbol: "E£",
    name: "Egyptian Pound",
    locale: "en-EG",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
