import type { CountryConfig, CurrencyConfig } from "../types";

export const AE_CURRENCY: CurrencyConfig = {
  code: "AED",
  symbol: "AED",
  name: "UAE Dirham",
  locale: "en-AE",
};

export const AE_CONFIG: CountryConfig = {
  code: "AE",
  name: "United Arab Emirates",
  currency: AE_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
