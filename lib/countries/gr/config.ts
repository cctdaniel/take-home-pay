// ============================================================================
// GREECE COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const GR_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "el-GR",
};

export const GR_CONFIG: CountryConfig = {
  code: "GR",
  name: "Greece",
  currency: GR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
