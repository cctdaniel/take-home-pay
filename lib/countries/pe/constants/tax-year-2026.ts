// Peru 2026 salary tax parameters
// Source: https://www.gob.pe/sunat

import type { TaxBracket } from "../../types";

export const PE_TAX_YEAR = 2026;

export const PE_SOURCE_URLS = {
  sunat: "https://www.gob.pe/sunat",
  uit: "https://www.gob.pe/institucion/mef/colecciones/1478-unidad-impositiva-tributaria-uit",
} as const;

/** Unidad Impositiva Tributaria (UIT) 2026. */
export const PE_UIT_2026 = 5_500;

/** Employee pension contribution — blended ONP/AFP rate on gross. */
export const PE_PENSION_EMPLOYEE_RATE = 0.13;

/** Standard 7 UIT work-income deduction before PIT. */
export const PE_WORK_INCOME_DEDUCTION_UIT = 7;
export const PE_WORK_INCOME_DEDUCTION_ANNUAL = PE_WORK_INCOME_DEDUCTION_UIT * PE_UIT_2026;

/** Fifth-category income tax brackets (annual PEN). */
export const PE_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 27_500, rate: 0.08 },
  { min: 27_500, max: 110_000, rate: 0.14 },
  { min: 110_000, max: 192_500, rate: 0.17 },
  { min: 192_500, max: 247_500, rate: 0.2 },
  { min: 247_500, max: Infinity, rate: 0.3 },
];
