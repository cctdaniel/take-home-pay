// ============================================================================
// THAILAND COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const TH_CURRENCY: CurrencyConfig = {
  code: "THB",
  symbol: "฿",
  name: "Thai Baht",
  locale: "th-TH",
};

export const TH_CONFIG: CountryConfig = {
  code: "TH",
  name: "Thailand",
  currency: TH_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-30",
  defaultRegion: undefined, // Thailand has no regional subdivisions for tax
  supportsFilingStatus: false, // Thailand doesn't use US-style filing status
  supportsRegions: false, // No states/provinces in Thailand
};
