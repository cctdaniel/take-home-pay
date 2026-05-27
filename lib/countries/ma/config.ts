import type { CountryConfig } from "../types";

export const MA_CONFIG = {
  code: "MA",
  name: "Morocco",
  region: "Africa",
  currency: {
    code: "MAD",
    symbol: "DH",
    name: "Moroccan Dirham",
    locale: "fr-MA",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
