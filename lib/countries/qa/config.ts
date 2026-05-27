import type { CountryConfig } from "../types";

export const QA_CONFIG = {
  code: "QA",
  name: "Qatar",
  region: "Middle East",
  currency: {
    code: "QAR",
    symbol: "QR",
    name: "Qatari Riyal",
    locale: "en-QA",
  },
  taxYear: 2026,
  lastUpdated: "2026-05-24",
  supportsFilingStatus: false,
  supportsRegions: false,
} satisfies CountryConfig;
