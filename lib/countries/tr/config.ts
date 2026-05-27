import type { CountryConfig, CurrencyConfig } from "../types";

export const TR_CURRENCY: CurrencyConfig = {
  code: "TRY",
  symbol: "₺",
  name: "Turkish Lira",
  locale: "tr-TR",
};

export const TR_CONFIG: CountryConfig = {
  code: "TR",
  name: "Turkey",
  region: "Europe",
  currency: TR_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
