// ============================================================================
// CROATIA COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const HR_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "hr-HR",
};

export const HR_CONFIG: CountryConfig = {
  code: "HR",
  name: "Croatia",
  currency: HR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: "zagreb",
  supportsFilingStatus: false,
  supportsRegions: true,
};
