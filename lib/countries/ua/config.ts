import type { CountryConfig, CurrencyConfig } from "../types";

export const UA_CURRENCY: CurrencyConfig = {
  code: "UAH",
  symbol: "₴",
  name: "Ukrainian Hryvnia",
  locale: "uk-UA",
};

export const UA_CONFIG: CountryConfig = {
  code: "UA",
  name: "Ukraine",
  region: "Europe",
  currency: UA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-29",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
