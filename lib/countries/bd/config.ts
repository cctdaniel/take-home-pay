import type { CountryConfig, CurrencyConfig } from "../types";

export const BD_CURRENCY: CurrencyConfig = {
  code: "BDT",
  symbol: "৳",
  name: "Bangladeshi Taka",
  locale: "bn-BD",
};

export const BD_CONFIG: CountryConfig = {
  code: "BD",
  name: "Bangladesh",
  region: "Asia-Pacific",
  currency: BD_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
