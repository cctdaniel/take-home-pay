import type { CountryConfig } from "../types";

export const KH_CONFIG = {
  code: "KH",
  name: "Cambodia",
  region: "Asia-Pacific",
  currency: {
    code: "KHR",
    symbol: "KHR",
    name: "Cambodian Riel",
    locale: "km-KH",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
