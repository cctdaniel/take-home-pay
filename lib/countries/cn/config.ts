import type { CountryConfig, CurrencyConfig } from "../types";

export const CN_CURRENCY: CurrencyConfig = {
  code: "CNY",
  symbol: "¥",
  name: "Chinese Yuan Renminbi",
  locale: "zh-CN",
};

export const CN_CONFIG: CountryConfig = {
  code: "CN",
  name: "China",
  region: "Asia-Pacific",
  currency: CN_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
