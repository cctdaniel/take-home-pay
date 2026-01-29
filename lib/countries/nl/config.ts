// ============================================================================
// NETHERLANDS COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const NL_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "nl-NL",
};

export const NL_CONFIG: CountryConfig = {
  code: "NL",
  name: "Netherlands",
  currency: NL_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-28",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
