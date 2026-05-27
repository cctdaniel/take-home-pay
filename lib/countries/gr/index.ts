// ============================================================================
// GREECE MODULE EXPORTS
// ============================================================================

export { GRCalculator, calculateGR } from "./calculator";
export { GR_CONFIG, GR_CURRENCY } from "./config";
export type {
  GRBreakdown,
  GRCalculatorInputs,
  GRContributionInputs,
  GRResidencyType,
  GRTaxBreakdown,
  GRTaxRegime,
} from "./types";
export {
  GREECE_ARTICLE_5C_NEW_RESIDENT_REGIME_2026,
  GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE,
  GREECE_SOCIAL_INSURANCE_2026,
  getGreekEmploymentTaxBrackets2026,
} from "./constants/tax-brackets-2026";
