// ==========================================================================
// UNITED KINGDOM COUNTRY CONFIGURATION
// Tax Year: 2026/27 (6 April 2026 to 5 April 2027)
//
// Official Sources:
// - HMRC Rates and Thresholds for Employers 2026/27:
//   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// - GOV.UK Income Tax Rates:
//   https://www.gov.uk/income-tax-rates
// ==========================================================================

import type { CountryConfig, CurrencyConfig } from "../types";

export const UK_CURRENCY: CurrencyConfig = {
  code: "GBP",
  symbol: "£",
  name: "British Pound",
  locale: "en-GB",
};

export const UK_CONFIG: CountryConfig = {
  code: "UK",
  name: "United Kingdom",
  currency: UK_CURRENCY,
  taxYear: 2027, // Tax year 2026/27 (6 Apr 2026 - 5 Apr 2027)
  lastUpdated: "2026-02-02",
  defaultRegion: "rest_of_uk",
  supportsFilingStatus: false,
  supportsRegions: true, // Scotland uses different income tax bands
};
