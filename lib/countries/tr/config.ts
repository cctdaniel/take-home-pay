import type { CountryConfig } from "../types";

export const TR_CONFIG = {
  code: "TR",
  name: "Turkey",
  region: "Europe",
  currency: {
    code: "TRY",
    symbol: "TL",
    name: "Turkish Lira",
    locale: "tr-TR",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
