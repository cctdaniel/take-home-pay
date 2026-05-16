// ============================================================================
// GEORGIA COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const GE_CURRENCY: CurrencyConfig = {
  code: "GEL",
  symbol: "₾",
  name: "Georgian Lari",
  locale: "ka-GE",
};

export const GE_CONFIG: CountryConfig = {
  code: "GE",
  name: "Georgia",
  region: "Europe",
  currency: GE_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
