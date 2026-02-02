import type { CountryConfig, CurrencyConfig } from "../types";

export const ID_CURRENCY: CurrencyConfig = {
  code: "IDR",
  symbol: "Rp",
  name: "Indonesian Rupiah",
  locale: "id-ID",
};

export const ID_CONFIG: CountryConfig = {
  code: "ID",
  name: "Indonesia",
  currency: ID_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-02-02",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
