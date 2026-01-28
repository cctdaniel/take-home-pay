// ============================================================================
// SINGAPORE COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const SG_CURRENCY: CurrencyConfig = {
  code: "SGD",
  symbol: "S$",
  name: "Singapore Dollar",
  locale: "en-SG",
};

export const SG_CONFIG: CountryConfig = {
  code: "SG",
  name: "Singapore",
  currency: SG_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-28",
  defaultRegion: undefined, // Singapore has no regional subdivisions for tax
  supportsFilingStatus: false, // SG doesn't use US-style filing status
  supportsRegions: false, // No states/provinces in SG
};
