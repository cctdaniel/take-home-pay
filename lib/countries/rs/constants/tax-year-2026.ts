// Serbia 2026 salary tax parameters
// Source: https://www.purs.gov.rs/

import type { TaxBracket } from "../../types";

export const RS_TAX_YEAR = 2026;

export const RS_SOURCE_URLS = {
  purs: "https://www.purs.gov.rs/",
  socialContributions:
    "https://www.purs.gov.rs/en/individuals-and-entrepreneurs/employees/social-contributions.html",
} as const;

/** Employee social contributions — 19.9% (14% PIO + 5.15% health + 0.75% unemployment). */
export const RS_SOCIAL_EMPLOYEE_RATE = 0.199;
export const RS_SOCIAL_MONTHLY_CAP = 732_820;
export const RS_SOCIAL_ANNUAL_CAP = RS_SOCIAL_MONTHLY_CAP * 12;

/** Annual non-taxable amount — RSD 34,221/month × 12. */
export const RS_NON_TAXABLE_MONTHLY = 34_221;
export const RS_NON_TAXABLE_ANNUAL = RS_NON_TAXABLE_MONTHLY * 12;

/** Flat 10% personal income tax on taxable salary income. */
export const RS_PIT_RATE = 0.1;

export const RS_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: Infinity, rate: RS_PIT_RATE },
];

/** Tax-exempt voluntary pension + health insurance payroll contributions (combined cap). */
// Source: https://www.raiffeisenfuture.rs/maksimalni-neoporezivi-iznos-doprinosa-od-1-februara-2026-godine/
export const RS_VOLUNTARY_PENSION_MONTHLY_CAP = 8_677;
export const RS_VOLUNTARY_PENSION_ANNUAL_CAP = RS_VOLUNTARY_PENSION_MONTHLY_CAP * 12;
