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
  region: "Europe",
  currency: PT_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
