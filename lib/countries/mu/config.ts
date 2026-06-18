import type { CountryConfig, CurrencyConfig } from "../types";

export const MU_CURRENCY: CurrencyConfig = {
  code: "MUR",
  symbol: "Rs",
  name: "Mauritian Rupee",
  locale: "en-MU",
};

export const MU_CONFIG: CountryConfig = {
  code: "MU",
  name: "Mauritius",
  region: "Africa",
  currency: MU_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
