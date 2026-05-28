import type { CountryConfig, CurrencyConfig } from "../types";

export const PL_CURRENCY: CurrencyConfig = {
  code: "PLN",
  symbol: "zł",
  name: "Polish Zloty",
  locale: "pl-PL",
};

export const PL_CONFIG: CountryConfig = {
  code: "PL",
  name: "Poland",
  region: "Europe",
  currency: PL_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
