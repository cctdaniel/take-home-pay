import type { CountryConfig, CurrencyConfig } from "../types";

export const LV_CURRENCY: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  name: "Euro",
  locale: "lv-LV",
};

export const LV_CONFIG: CountryConfig = {
  code: "LV",
  name: "Latvia",
  region: "Europe",
  currency: LV_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
