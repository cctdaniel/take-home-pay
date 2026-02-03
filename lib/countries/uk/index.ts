// ==========================================================================
// UNITED KINGDOM MODULE EXPORTS
// Tax Year: 2026/27 (6 April 2026 to 5 April 2027)
//
// Official Sources:
// - HMRC Rates and Thresholds for Employers 2026/27:
//   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// - GOV.UK Income Tax Rates:
//   https://www.gov.uk/income-tax-rates
// ==========================================================================

export { UKCalculator, calculateUK } from "./calculator";
export { UK_CONFIG, UK_CURRENCY } from "./config";
export {
  UK_INCOME_TAX_BANDS_RUK,
  UK_INCOME_TAX_BANDS_SCOTLAND,
  UK_NI_RATES_2026_27,
  UK_NI_THRESHOLDS_2026_27,
  UK_PERSONAL_ALLOWANCE,
  UK_PERSONAL_ALLOWANCE_TAPER_THRESHOLD,
  UK_PERSONAL_ALLOWANCE_ZERO_AT,
  UK_PENSION_ANNUAL_ALLOWANCE,
  UK_TAX_YEAR_LABEL,
  calculateNationalInsurance,
  calculatePersonalAllowance,
  calculatePensionTaxRelief,
  calculateProgressiveTax,
  roundToPence,
} from "./constants/tax-brackets-2026-27";
