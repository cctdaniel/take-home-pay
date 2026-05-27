import type { CountryConfig } from "../types";

export const BH_CONFIG = {
  code: "BH",
  name: "Bahrain",
  region: "Middle East",
  currency: {
    code: "BHD",
    symbol: "BD",
    name: "Bahraini Dinar",
    locale: "en-BH",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
