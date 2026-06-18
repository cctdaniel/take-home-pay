import type { TaxBracket } from "../../types";

// Barbados salary tax parameters — 2026
// Sources: https://www.bra.gov.bb/ | https://www.nis.gov.bb/

export const BB_TAX_YEAR = 2026;

export const BB_SOURCE_URLS = {
  incomeTax: "https://www.bra.gov.bb/",
  socialInsurance: "https://www.nis.gov.bb/",
} as const;

/** NIS employee contribution rate on insurable earnings. */
export const BB_NIS_EMPLOYEE_RATE = 0.11;

/** Maximum insurable monthly earnings for NIS (BBD). */
export const BB_NIS_MONTHLY_CAP = 5_280;

export const BB_NIS_ANNUAL_CAP = BB_NIS_MONTHLY_CAP * 12;

/** National Resilience Fund employee levy on gross. */
export const BB_RESILIENCE_FUND_RATE = 0.0025;

/** Personal allowance deducted before PAYE (BBD). */
export const BB_PAYE_ALLOWANCE_2026 = 25_000;

/** PAYE brackets on income after personal allowance (BBD). NIS is not deductible. */
export const BB_PAYE_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 50_000, rate: 0.125 },
  { min: 50_000, max: Infinity, rate: 0.285 },
];
