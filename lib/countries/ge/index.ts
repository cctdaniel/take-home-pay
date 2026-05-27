// ============================================================================
// GEORGIA MODULE EXPORTS
// ============================================================================

export { calculateGE, GECalculator } from "./calculator";
export { GE_CONFIG, GE_CURRENCY } from "./config";
export {
  calculateGeorgiaSmallBusinessTax,
  calculateGeorgiaStatePensionContribution,
  GE_INCOME_TAX_2026,
  GE_MICRO_BUSINESS_2026,
  GE_MODELED_EXCLUSIONS_2026,
  GE_PENSION_2026,
  GE_SMALL_BUSINESS_2026,
} from "./constants/tax-brackets-2026";
export type {
  GEBreakdown,
  GECalculatorInputs,
  GEContributionInputs,
  GEIncomeRegime,
  GEPensionParticipation,
  GEResidencyType,
  GESmallBusinessThresholdTreatment,
  GETaxBreakdown,
} from "./types";
