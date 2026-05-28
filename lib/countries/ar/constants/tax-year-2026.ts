// Re-exports for H1 2026 ganancias + social (backward compatible imports).
import {
  AR_GANANCIAS_H1_2026,
  art94SlicesToBrackets,
  calculateArGananciasTax,
} from "./ganancias-semesters";

export {
  AR_GANANCIAS_H1_2026,
  AR_GANANCIAS_H2_2026,
  AR_GANANCIAS_H2_2026_AVAILABLE,
  AR_GANANCIAS_SEMESTERS,
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
} from "./ganancias-semesters";

/** @deprecated Use AR_GANANCIAS_H1_2026.deductions */
export const AR_DEDUCTIONS_2026 = AR_GANANCIAS_H1_2026.deductions;

/** @deprecated Use AR_GANANCIAS_H1_2026.art94Slices */
export const AR_ART94_SLICES_2026 = AR_GANANCIAS_H1_2026.art94Slices;

/** @deprecated Use art94SlicesToBrackets(AR_GANANCIAS_H1_2026.art94Slices) */
export const AR_INCOME_TAX_BRACKETS_2026 = art94SlicesToBrackets(
  AR_GANANCIAS_H1_2026.art94Slices,
);

/** @deprecated Use getArGananciasParams("h1").periodLabel */
export const AR_TAX_PERIOD_2026 = AR_GANANCIAS_H1_2026.periodLabel;

/** Voluntary retirement (aportes voluntarios) — additional ganancias deduction up to 12% of gross. */
export const AR_VOLUNTARY_RETIREMENT_MAX_RATE = 0.12;

export const AR_SOCIAL_2026 = {
  jubilacionRate: 0.11,
  obraSocialRate: 0.03,
  pamiRate: 0.03,
} as const;

/** @deprecated Use AR_GANANCIAS_H1_2026.sourceUrls */
export const AR_SOURCE_URLS = AR_GANANCIAS_H1_2026.sourceUrls;

/** @deprecated Use calculateArGananciasTax */
export const calculateArProgressiveTax = calculateArGananciasTax;
