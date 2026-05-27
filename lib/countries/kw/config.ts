import type { CountryConfig } from "../types";

export const KW_CONFIG = {
  code: "KW",
  name: "Kuwait",
  region: "Middle East",
  currency: {
    code: "KWD",
    symbol: "KD",
    name: "Kuwaiti Dinar",
    locale: "en-KW",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
