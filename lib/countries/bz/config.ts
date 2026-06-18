import type { CountryConfig, CurrencyConfig } from "../types";

export const BZ_CURRENCY: CurrencyConfig = {
  code: "BZD",
  symbol: "BZ$",
  name: "Belize Dollar",
  locale: "en-BZ",
};

export const BZ_CONFIG: CountryConfig = {
  code: "BZ",
  name: "Belize",
  region: "North America",
  currency: BZ_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-06-17",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
