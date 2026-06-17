// ============================================================================
// KAZAKHSTAN COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const KZ_CURRENCY: CurrencyConfig = {
  code: "KZT",
  symbol: "₸",
  name: "Kazakhstani Tenge",
  locale: "kk-KZ",
};

export const KZ_CONFIG: CountryConfig = {
  code: "KZ",
  name: "Kazakhstan",
  region: "Asia-Pacific",
  currency: KZ_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
