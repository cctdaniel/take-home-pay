import type { TaxBracket } from "../../types";

// Luxembourg 2026 employment tax parameters
// Sources: https://impotsdirects.public.lu/ ; https://ccss.lu/

export const LU_TAX_YEAR = 2026;

export const LU_SOURCE_URLS = {
  incomeTax:
    "https://impotsdirects.public.lu/fr/bareme-impot-2026.html",
  socialSecurity:
    "https://ccss.lu/fr/employeurs/calculer-cotisations-sociales",
} as const;

/** Combined employee social security rate on capped insurable earnings. */
export const LU_EMPLOYEE_SOCIAL_RATE = 0.1245;

/** Annual maximum insurable earnings base for employee social contributions (2026). */
export const LU_EMPLOYEE_SOCIAL_CAP_ANNUAL_2026 = 140_364;

/** Progressive PIT brackets on annual taxable income after employee social. */
export const LU_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 11_269, rate: 0 },
  { min: 11_269, max: 14_999, rate: 0.08 },
  { min: 14_999, max: 19_999, rate: 0.09 },
  { min: 19_999, max: 39_999, rate: 0.1 },
  { min: 39_999, max: 99_999, rate: 0.12 },
  { min: 99_999, max: 199_999, rate: 0.14 },
  { min: 199_999, max: 299_999, rate: 0.16 },
  { min: 299_999, max: Infinity, rate: 0.17 },
];
