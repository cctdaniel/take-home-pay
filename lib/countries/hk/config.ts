// ============================================================================
// HONG KONG COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const HK_CURRENCY: CurrencyConfig = {
  code: "HKD",
  symbol: "HK$",
  name: "Hong Kong Dollar",
  locale: "en-HK",
};

export const HK_CONFIG: CountryConfig = {
  code: "HK",
  name: "Hong Kong",
  currency: HK_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-30",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
