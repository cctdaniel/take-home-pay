// ============================================================================
// AUSTRALIA COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const AU_CURRENCY: CurrencyConfig = {
  code: "AUD",
  symbol: "A$",
  name: "Australian Dollar",
  locale: "en-AU",
};

export const AU_CONFIG: CountryConfig = {
  code: "AU",
  name: "Australia",
  currency: AU_CURRENCY,
  taxYear: 2026, // FY 2025-26 (July 2025 - June 2026)
  lastUpdated: "2026-01-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false, // No state income tax in Australia (GST is federal)
};
