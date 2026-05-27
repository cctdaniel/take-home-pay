import type { CountryConfig } from "../types";

export const OM_CONFIG = {
  code: "OM",
  name: "Oman",
  region: "Middle East",
  currency: {
    code: "OMR",
    symbol: "OMR",
    name: "Omani Rial",
    locale: "en-OM",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
