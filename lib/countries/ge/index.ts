// ============================================================================
// GEORGIA MODULE EXPORTS
// ============================================================================

export { calculateGE, GECalculator } from "./calculator";
export { GE_CONFIG, GE_CURRENCY } from "./config";
export {
  calculateGeorgiaStatePensionContribution,
  GE_INCOME_TAX_2026,
  GE_MODELED_EXCLUSIONS_2026,
  GE_PENSION_2026,
} from "./constants/tax-brackets-2026";
export type {
  GEBreakdown,
  GECalculatorInputs,
  GEContributionInputs,
  GEPensionParticipation,
  GEResidencyType,
  GETaxBreakdown,
} from "./types";
