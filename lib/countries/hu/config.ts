import type { CountryConfig } from "../types";

export const HU_CONFIG = {
  code: "HU",
  name: "Hungary",
  region: "Europe",
  currency: {
    code: "HUF",
    symbol: "Ft",
    name: "Hungarian Forint",
    locale: "hu-HU",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
