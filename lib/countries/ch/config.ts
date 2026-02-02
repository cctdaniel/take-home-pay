// ============================================================================
// SWITZERLAND COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const CH_CURRENCY: CurrencyConfig = {
  code: "CHF",
  symbol: "CHF",
  name: "Swiss Franc",
  locale: "de-CH",
};

export const CH_CONFIG: CountryConfig = {
  code: "CH",
  name: "Switzerland",
  currency: CH_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-02-02",
  defaultRegion: "ZH", // Zurich as default representative canton
  supportsFilingStatus: true,
  supportsRegions: true,
};
