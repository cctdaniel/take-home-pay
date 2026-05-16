// ============================================================================
// SPAIN COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const ES_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "EUR",
  name: "Euro",
  locale: "es-ES",
};

export const ES_CONFIG: CountryConfig = {
  code: "ES",
  name: "Spain",
  currency: ES_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-15",
  defaultRegion: "general",
  supportsFilingStatus: true,
  supportsRegions: true,
};
