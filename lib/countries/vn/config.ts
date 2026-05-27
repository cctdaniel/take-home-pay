import type { CountryConfig, CurrencyConfig } from "../types";

export const VN_CURRENCY: CurrencyConfig = {
  code: "VND",
  symbol: "\u20ab",
  name: "Vietnamese Dong",
  locale: "vi-VN",
};

export const VN_CONFIG: CountryConfig = {
  code: "VN",
  name: "Vietnam",
  region: "Asia-Pacific",
  currency: VN_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-25",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
