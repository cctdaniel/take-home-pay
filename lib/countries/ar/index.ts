export { calculateAR, ARCalculator } from "./calculator";
export { AR_CONFIG, AR_CURRENCY } from "./config";
export {
  AR_GANANCIAS_H1_2026,
  AR_GANANCIAS_H2_2026,
  AR_GANANCIAS_SEMESTERS,
  AR_SOCIAL_2026,
  AR_VOLUNTARY_RETIREMENT_MAX_RATE,
  art94SlicesToBrackets,
  calculateArFamilyDeductions,
  calculateArGananciasTax,
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
