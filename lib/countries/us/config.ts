// ============================================================================
// US COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const US_CURRENCY: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  locale: "en-US",
};

export const US_CONFIG: CountryConfig = {
  code: "US",
  name: "United States",
  currency: US_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-27",
  defaultRegion: "CA",
  supportsFilingStatus: true,
  supportsRegions: true, // US has 50 states + DC
};
