import type { TaxBracket } from "../../types";

// Albania salary tax parameters — 2026
// Sources: https://www.tatime.gov.al/

export const AL_TAX_YEAR = 2026;

export const AL_SOURCE_URLS = {
  incomeTax: "https://www.tatime.gov.al/",
  socialInsurance: "https://www.tatime.gov.al/",
  voluntaryPension: "https://taxsummaries.pwc.com/albania/individual/deductions",
} as const;

/** Law on Voluntary Pension Funds (76/2023): max monthly tax benefit at national minimum wage. */
export const AL_VOLUNTARY_PENSION_ANNUAL_CAP = 480_000;

/** Combined employee social insurance (health 1.7% + social 9.5%). */
export const AL_SOCIAL_EMPLOYEE_RATE = 0.112;

/** Maximum insurable monthly wage (ALL). */
export const AL_SOCIAL_MONTHLY_CAP = 186_416;

export const AL_SOCIAL_ANNUAL_CAP = AL_SOCIAL_MONTHLY_CAP * 12;

/** Annual personal deduction before PIT (ALL). */
export const AL_PERSONAL_DEDUCTION_2026 = 360_000;

/** Progressive PIT brackets on taxable income after social and personal deduction. */
export const AL_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 2_040_000, rate: 0.13 },
  { min: 2_040_000, max: Infinity, rate: 0.23 },
];
