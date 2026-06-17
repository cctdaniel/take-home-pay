import type { CountryConfig, CurrencyConfig } from "../types";

export const AL_CURRENCY: CurrencyConfig = {
  code: "ALL",
  symbol: "L",
  name: "Albanian Lek",
  locale: "sq-AL",
};

export const AL_CONFIG: CountryConfig = {
  code: "AL",
  name: "Albania",
  region: "Europe",
  currency: AL_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
