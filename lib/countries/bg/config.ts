import type { CountryConfig, CurrencyConfig } from "../types";

export const BG_CURRENCY: CurrencyConfig = {
  code: "BGN",
  symbol: "лв",
  name: "Bulgarian Lev",
  locale: "bg-BG",
};

export const BG_CONFIG: CountryConfig = {
  code: "BG",
  name: "Bulgaria",
  region: "Europe",
  currency: BG_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
