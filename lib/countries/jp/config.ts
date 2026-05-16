import type { CountryConfig, CurrencyConfig } from "../types";

export const JP_CURRENCY: CurrencyConfig = {
  code: "JPY",
  symbol: "\u00a5",
  name: "Japanese Yen",
  locale: "ja-JP",
};

export const JP_CONFIG: CountryConfig = {
  code: "JP",
  name: "Japan",
  region: "Asia-Pacific",
  currency: JP_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
