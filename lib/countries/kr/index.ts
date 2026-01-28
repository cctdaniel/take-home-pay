// ============================================================================
// SOUTH KOREA COUNTRY MODULE - MAIN EXPORT
// ============================================================================

export { KRCalculator, calculateKR } from "./calculator";
export { KR_CONFIG, KR_CURRENCY } from "./config";

// Tax and social insurance exports
export {
  KR_INCOME_TAX_BRACKETS,
  KR_LOCAL_TAX_RATE,
  KR_SOCIAL_INSURANCE,
  KR_TAX_DEDUCTIONS,
  calculateEmploymentIncomeDeduction,
  calculateProgressiveIncomeTax,
  calculateNationalPension,
  calculateHealthInsurance,
  calculateLongTermCare,
  calculateEmploymentInsurance,
  calculateWageEarnerTaxCredit,
} from "./constants/tax-brackets-2026";
