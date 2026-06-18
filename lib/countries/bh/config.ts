import type { CountryConfig, CurrencyConfig } from "../types";

export const BH_CURRENCY: CurrencyConfig = {
  code: "BHD",
  symbol: "BD",
  name: "Bahraini Dinar",
  locale: "ar-BH",
};

export const BH_CONFIG: CountryConfig = {
  code: "BH",
  name: "Bahrain",
  region: "Middle East",
  currency: BH_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
