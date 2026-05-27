import type { CountryConfig } from "../types";

export const JO_CONFIG = {
  code: "JO",
  name: "Jordan",
  region: "Middle East",
  currency: {
    code: "JOD",
    symbol: "JD",
    name: "Jordanian Dinar",
    locale: "en-JO",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
