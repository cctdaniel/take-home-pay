// ============================================================================
// THAILAND COUNTRY MODULE - MAIN EXPORT
// ============================================================================

export { THCalculator, calculateTH } from "./calculator";
export { TH_CONFIG, TH_CURRENCY } from "./config";

// Tax exports
export {
  TH_TAX_BRACKETS,
  TH_NON_RESIDENT_FLAT_RATE,
  TH_STANDARD_DEDUCTIONS,
  TH_TAX_ALLOWANCES,
  TH_SOCIAL_SECURITY,
  TH_PROVIDENT_FUND,
  calculateProgressiveTax,
  calculateStandardDeduction,
  calculateSocialSecurityContribution,
  calculateTHIncomeTax,
  type THTaxResult,
} from "./constants/tax-brackets-2026";
