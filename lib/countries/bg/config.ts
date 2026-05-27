import type { CountryConfig } from "../types";

export const BG_CONFIG = {
  code: "BG",
  name: "Bulgaria",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "en-BG",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
