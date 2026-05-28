import type { CountryConfig, CurrencyConfig } from "../types";

export const QA_CURRENCY: CurrencyConfig = {
  code: "QAR",
  symbol: "QR",
  name: "Qatari Riyal",
  locale: "ar-QA",
};

export const QA_CONFIG: CountryConfig = {
  code: "QA",
  name: "Qatar",
  region: "Middle East",
  currency: QA_CURRENCY,
  taxYear: 2026,
  lastUpdated: "2026-05-27",
  defaultRegion: undefined,
  supportsFilingStatus: false,
  supportsRegions: false,
};
