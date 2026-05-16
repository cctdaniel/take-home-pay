import type { CountryConfig, CurrencyConfig } from "../types";

export const PH_CURRENCY: CurrencyConfig = {
  code: "PHP",
  symbol: "₱",
  name: "Philippine Peso",
  locale: "en-PH",
};

export const PH_CONFIG: CountryConfig = {
  code: "PH",
  name: "Philippines",
  currency: PH_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-16",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
