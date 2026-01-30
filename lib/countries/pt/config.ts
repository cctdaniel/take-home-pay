// ============================================================================
// PORTUGAL COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const PT_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "pt-PT",
};

export const PT_CONFIG: CountryConfig = {
  code: "PT",
  name: "Portugal",
  currency: PT_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-30",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
