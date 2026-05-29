// Lithuania 2026 salary tax parameters
// Sources: https://www.vmi.lt/ , https://www.sodra.lt/

import type { TaxBracket } from "../../types";

export const LT_TAX_YEAR = 2026;

/** Pension + life insurance deductions (combined cap for qualifying III-pillar contracts). */
export const LT_PENSION_DEDUCTION_ANNUAL_CAP_2026 = 1_500;
export const LT_PENSION_DEDUCTION_RATE_OF_INCOME = 0.25;

export const LT_SOURCE_URLS = {
  personalIncomeTax: "https://www.vmi.lt/cms/en/income-tax",
  socialInsurance:
    "https://www.sodra.lt/en/average-wages-and-contribution-rates",
} as const;

/** Employee VSD (social insurance) — 19.5% on capped assessment base. */
export const LT_VSD_EMPLOYEE_RATE = 0.195;
export const LT_VSD_ANNUAL_CAP = 138_729;

export const LT_GPM_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 83_237.4, rate: 0.2 },
  { min: 83_237.4, max: 138_729, rate: 0.25 },
  { min: 138_729, max: Infinity, rate: 0.32 },
];
