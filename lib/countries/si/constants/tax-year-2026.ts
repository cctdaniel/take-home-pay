// Slovenia 2026 salary tax parameters
// Sources: https://www.fu.gov.si/ , https://www.zpiz.si/

import type { TaxBracket } from "../../types";

export const SI_TAX_YEAR = 2026;

export const SI_SOURCE_URLS = {
  personalIncomeTax: "https://www.fu.gov.si/en/taxes/income_tax/",
  socialInsurance:
    "https://www.zpiz.si/en/about-pension-and-disability-insurance/contribution-rates/",
} as const;

/** Employee social contributions — 22.1% on gross. */
export const SI_SOCIAL_EMPLOYEE_RATE = 0.221;
/** Pension portion of employee social (for supplementary premium cap). */
export const SI_PENSION_EMPLOYEE_RATE = 0.155;
export const SI_SUPPLEMENTARY_PENSION_ANNUAL_CAP_2026 = 3_224.18;
export const SI_SUPPLEMENTARY_PENSION_RATE_OF_GROSS = 0.05844;
export const SI_SUPPLEMENTARY_PENSION_RATE_OF_PENSION = 0.24;

export const SI_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 17_533, rate: 0.16 },
  { min: 17_533, max: 25_436, rate: 0.26 },
  { min: 25_436, max: 55_724, rate: 0.33 },
  { min: 55_724, max: 81_533, rate: 0.39 },
  { min: 81_533, max: Infinity, rate: 0.5 },
];
