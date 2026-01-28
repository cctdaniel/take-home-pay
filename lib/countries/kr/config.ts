// ============================================================================
// SOUTH KOREA COUNTRY CONFIGURATION
// ============================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const KR_CURRENCY: CurrencyConfig = {
  code: "KRW",
  symbol: "₩",
  name: "South Korean Won",
  locale: "ko-KR",
};

export const KR_CONFIG: CountryConfig = {
  code: "KR",
  name: "South Korea",
  currency: KR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-01-28",
  defaultRegion: undefined, // South Korea has no regional subdivisions for tax
  supportsFilingStatus: false, // KR doesn't use US-style filing status
  supportsRegions: false, // No states/provinces in KR for tax purposes
};
