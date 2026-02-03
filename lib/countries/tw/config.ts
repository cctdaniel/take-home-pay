// ============================================================================
// TAIWAN COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const TW_CURRENCY: CurrencyConfig = {
  code: "TWD",
  symbol: "NT$",
  name: "New Taiwan Dollar",
  locale: "zh-TW",
};

export const TW_CONFIG: CountryConfig = {
  code: "TW",
  name: "Taiwan",
  currency: TW_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-15",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
