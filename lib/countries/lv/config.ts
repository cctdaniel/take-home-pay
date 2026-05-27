import type { CountryConfig } from "../types";

export const LV_CONFIG = {
  code: "LV",
  name: "Latvia",
  region: "Europe",
  currency: {
    code: "EUR",
    symbol: "EUR",
    name: "Euro",
    locale: "lv-LV",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
