// Slovakia 2026 salary tax parameters
// Sources: https://www.financnasprava.sk/ , https://www.socpoist.sk/

import type { TaxBracket } from "../../types";

export const SK_TAX_YEAR = 2026;

export const SK_SOURCE_URLS = {
  personalIncomeTax:
    "https://www.financnasprava.sk/sk/elektronicke-sluzby/elektronicka-kalkulacka-dane-z-prijmov",
  socialInsurance:
    "https://www.socpoist.sk/socialne-poistenie/sadzby-socialneho-poistenia/",
  healthInsurance:
    "https://www.financnasprava.sk/sk/elektronicke-sluzby/elektronicka-kalkulacka-dane-z-prijmov",
} as const;

/** Employee social insurance — 9.4% on capped assessment base. */
export const SK_SOCIAL_EMPLOYEE_RATE = 0.094;
/** Monthly maximum assessment base EUR 16,764 (annualized). */
export const SK_SOCIAL_MONTHLY_CAP = 16_764;
export const SK_SOCIAL_ANNUAL_CAP = SK_SOCIAL_MONTHLY_CAP * 12;

/** Employee health insurance — 5% on gross (uncapped). */
export const SK_HEALTH_EMPLOYEE_RATE = 0.05;

/** Non-taxable amount (NCZD) when pre-allowance base is at or below threshold. */
export const SK_NCZD_ANNUAL = 5_966.73;
export const SK_NCZD_THRESHOLD = 43_983.32;

export const SK_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 43_983.32, rate: 0.19 },
  { min: 43_983.32, max: 60_349.21, rate: 0.25 },
  { min: 60_349.21, max: 75_010.32, rate: 0.3 },
  { min: 75_010.32, max: Infinity, rate: 0.35 },
];

export function calculateSlovakAllowance(preAllowanceBase: number): number {
  return preAllowanceBase <= SK_NCZD_THRESHOLD ? SK_NCZD_ANNUAL : 0;
}
