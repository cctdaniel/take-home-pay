import type { CountryConfig } from "../types";

export const CW_CONFIG = {
  code: "CW",
  name: "Curacao",
  region: "Caribbean",
  currency: {
    code: "ANG",
    symbol: "NAf",
    name: "Netherlands Antillean Guilder",
    locale: "nl-CW",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
