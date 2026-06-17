import type { CountryConfig, CurrencyConfig } from "../types";

export const NG_CURRENCY: CurrencyConfig = {
  code: "NGN",
  symbol: "₦",
  name: "Nigerian Naira",
  locale: "en-NG",
};

export const NG_CONFIG: CountryConfig = {
  code: "NG",
  name: "Nigeria",
  region: "Africa",
  currency: NG_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
