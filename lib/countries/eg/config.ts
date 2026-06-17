import type { CountryConfig, CurrencyConfig } from "../types";

export const EG_CURRENCY: CurrencyConfig = {
  code: "EGP",
  symbol: "E£",
  name: "Egyptian Pound",
  locale: "ar-EG",
};

export const EG_CONFIG: CountryConfig = {
  code: "EG",
  name: "Egypt",
  region: "Africa",
  currency: EG_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
