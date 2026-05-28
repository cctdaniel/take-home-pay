export { calculateBR, BRCalculator } from "./calculator";
export { BR_CONFIG, BR_CURRENCY } from "./config";
export {
  BR_DEPENDENT_DEDUCTION_MONTHLY,
  BR_INSS_MONTHLY_CEILING,
  BR_SOURCE_URLS,
  calculateBrazilInssMonthly,
  calculateBrazilIrpfMonthly,
} from "./constants/tax-year-2026";
export type {
  BRBreakdown,
  BRCalculatorInputs,
  BRContributionInputs,
  BRTaxBreakdown,
} from "./types";
