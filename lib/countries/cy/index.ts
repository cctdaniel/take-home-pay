// ============================================================================
// CYPRUS MODULE EXPORTS
// ============================================================================

export { CYCalculator, calculateCY } from "./calculator";
export { CY_CONFIG, CY_CURRENCY } from "./config";
export type {
  CYBreakdown,
  CYCalculatorInputs,
  CYContributionInputs,
  CYEmploymentExemption,
  CYFamilyStatus,
  CYResidencyType,
  CYTaxBreakdown,
  CYTaxReliefInputs,
} from "./types";
export {
  CYPRUS_FIRST_EMPLOYMENT_EXEMPTIONS_2026,
  CYPRUS_GHS_2026,
  CYPRUS_SOCIAL_INSURANCE_2026,
  CYPRUS_TD59_DEDUCTIONS_2026,
  calculateCyprusDependentChildDeduction,
  calculateCyprusProgressiveTax,
  getCyprusFamilyIncomeThreshold,
  getCyprusSingleParentMultiplier,
} from "./constants/tax-brackets-2026";
