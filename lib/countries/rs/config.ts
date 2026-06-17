import type { CountryConfig, CurrencyConfig } from "../types";

export const RS_CURRENCY: CurrencyConfig = {
  code: "RSD",
  symbol: "дин.",
  name: "Serbian Dinar",
  locale: "sr-RS",
};

export const RS_CONFIG: CountryConfig = {
  code: "RS",
  name: "Serbia",
  region: "Europe",
  currency: RS_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
