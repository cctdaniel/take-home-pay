import type { CountryConfig } from "../types";

export const SC_CONFIG = {
  code: "SC",
  name: "Seychelles",
  region: "Africa",
  currency: {
    code: "SCR",
    symbol: "SR",
    name: "Seychellois Rupee",
    locale: "en-SC",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
