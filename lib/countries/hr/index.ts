// ============================================================================
// CROATIA MODULE EXPORTS
// ============================================================================

export { HRCalculator, calculateHR } from "./calculator";
export { HR_CONFIG, HR_CURRENCY } from "./config";
export {
  CROATIA_CONTRIBUTIONS_2026,
  CROATIA_INCOME_TAX_2026,
  CROATIA_LOCAL_TAX_RATES_2026,
  CROATIA_PERSONAL_ALLOWANCE_2026,
  getCroatiaLocalTaxRate,
} from "./constants/tax-brackets-2026";
export type { HRLocalityCode } from "./constants/tax-brackets-2026";
export type {
  HRBreakdown,
  HRCalculatorInputs,
  HRContributionInputs,
  HRPensionScheme,
  HRResidencyType,
  HRWorkScenario,
  HRTaxBreakdown,
} from "./types";
