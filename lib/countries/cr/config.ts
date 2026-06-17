// ============================================================================
// COSTA RICA COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const CR_CURRENCY: CurrencyConfig = {
  code: "CRC",
  symbol: "₡",
  name: "Costa Rican Colón",
  locale: "es-CR",
};

export const CR_CONFIG: CountryConfig = {
  code: "CR",
  name: "Costa Rica",
  region: "North America",
  currency: CR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
