import type { CountryConfig, CurrencyConfig } from "../types";

export const RO_CURRENCY: CurrencyConfig = {
  code: "RON",
  symbol: "lei",
  name: "Romanian Leu",
  locale: "ro-RO",
};

export const RO_CONFIG: CountryConfig = {
  code: "RO",
  name: "Romania",
  region: "Europe",
  currency: RO_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
