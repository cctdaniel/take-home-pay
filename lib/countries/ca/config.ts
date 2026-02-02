// ============================================================================
// CANADA COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const CA_CURRENCY: CurrencyConfig = {
  code: "CAD",
  symbol: "C$",
  name: "Canadian Dollar",
  locale: "en-CA",
};

export const CA_CONFIG: CountryConfig = {
  code: "CA",
  name: "Canada",
  currency: CA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-02-02",
  defaultRegion: "ON", // Ontario as default
  supportsFilingStatus: false,
  supportsRegions: true, // Provinces have different tax rates
};
