import type { TaxBracket } from "../../types";

// Dominican Republic salary tax parameters — 2026
// Sources: https://www.dgii.gov.do/

export const DO_TAX_YEAR = 2026;

export const DO_SOURCE_URLS = {
  incomeTax: "https://www.dgii.gov.do/",
  socialSecurity: "https://www.dgii.gov.do/",
  socialSecurityLaw: "https://www.dgii.gov.do/",
} as const;

/** TSS employee rate (AFP 2.87% + SFS 3.04%). */
export const DO_TSS_EMPLOYEE_RATE = 0.0591;

/** Annual exempt amount for ISR on salary (DOP). */
export const DO_ISR_EXEMPT_2026 = 416_220;

/** Progressive ISR brackets on annual salary after TSS (DOP). */
export const DO_ISR_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: DO_ISR_EXEMPT_2026, rate: 0 },
  { min: DO_ISR_EXEMPT_2026, max: 624_329, rate: 0.15 },
  { min: 624_329, max: 867_123, rate: 0.2 },
  { min: 867_123, max: Infinity, rate: 0.25 },
];
