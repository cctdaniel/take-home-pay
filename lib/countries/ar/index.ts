export { calculateAR, ARCalculator } from "./calculator";
export { AR_CONFIG, AR_CURRENCY } from "./config";
export {
  AR_ART94_SLICES_2026,
  AR_DEDUCTIONS_2026,
  AR_GANANCIAS_H1_2026,
  AR_GANANCIAS_H2_2026,
  AR_GANANCIAS_H2_2026_AVAILABLE,
  AR_GANANCIAS_SEMESTERS,
  AR_INCOME_TAX_BRACKETS_2026,
  AR_SOCIAL_2026,
  AR_SOURCE_URLS,
  AR_TAX_PERIOD_2026,
  AR_VOLUNTARY_RETIREMENT_MAX_RATE,
  art94SlicesToBrackets,
  calculateArFamilyDeductions,
  calculateArGananciasTax,
  calculateArProgressiveTax,
  getArGananciasParams,
  getDefaultArGananciasSemester,
  resolveArGananciasSemester,
  type ARGananciasSemester,
  type ArArt94Slice,
  type ArGananciasDeductions,
  type ArGananciasSemesterParams,
} from "./constants/tax-year-2026";
export type {
  ARBreakdown,
  ARCalculatorInputs,
  ARContributionInputs,
  ARTaxBreakdown,
} from "./types";
