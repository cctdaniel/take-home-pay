import type { CountryConfig, CurrencyConfig } from "../types";

export const PK_CURRENCY: CurrencyConfig = {
  code: "PKR",
  symbol: "₨",
  name: "Pakistani Rupee",
  locale: "en-PK",
};

export const PK_CONFIG: CountryConfig = {
  code: "PK",
  name: "Pakistan",
  region: "Asia-Pacific",
  currency: PK_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
