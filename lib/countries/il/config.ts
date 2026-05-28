import type { CountryConfig, CurrencyConfig } from "../types";

export const IL_CURRENCY: CurrencyConfig = {
  code: "ILS",
  symbol: "₪",
  name: "Israeli New Shekel",
  locale: "he-IL",
};

export const IL_CONFIG: CountryConfig = {
  code: "IL",
  name: "Israel",
  region: "Middle East",
  currency: IL_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
