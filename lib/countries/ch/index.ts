// ============================================================================
// SWITZERLAND MODULE EXPORTS
// ============================================================================

export { CHCalculator, calculateCH } from "./calculator";
export { CH_CONFIG, CH_CURRENCY } from "./config";
export {
  CH_ALV_2026,
  CH_BVG_2026,
  CH_CANTONAL_PROFILES,
  CH_DEFAULT_CANTON,
  CH_DEDUCTIONS_2026,
  CH_FEDERAL_CHILD_DEDUCTION,
  CH_FEDERAL_TAX_BRACKETS_MARRIED,
  CH_FEDERAL_TAX_BRACKETS_SINGLE,
  CH_HEALTH_INSURANCE_2026,
  CH_PILLAR3A_2026,
  CH_SOCIAL_SECURITY_2026,
  calculateCoordinatedSalary,
  getBVGContributionRate,
  getCantonalProfile,
  getFederalTaxBrackets,
  type CantonalTaxProfile,
  type CHFilingStatus,
} from "./constants/tax-brackets-2026";
export type {
  CHBreakdown,
  CHCalculatorInputs,
  CHContributionInputs,
  CHTaxBreakdown,
} from "./types-ch";
