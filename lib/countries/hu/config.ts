import type { CountryConfig, CurrencyConfig } from "../types";

export const HU_CURRENCY: CurrencyConfig = {
  code: "HUF",
  symbol: "Ft",
  name: "Hungarian Forint",
  locale: "hu-HU",
};

export const HU_CONFIG: CountryConfig = {
  code: "HU",
  name: "Hungary",
  region: "Europe",
  currency: HU_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
