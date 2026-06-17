import type { TaxBracket } from "../../types";

// Egypt salary tax parameters — 2026
// Sources: https://eta.gov.eg/

export const EG_TAX_YEAR = 2026;

export const EG_SOURCE_URLS = {
  incomeTax: "https://eta.gov.eg/",
  socialInsurance: "https://eta.gov.eg/",
} as const;

/** Simplified NOSI employee social insurance share on gross salary. */
export const EG_SOCIAL_INSURANCE_2026 = {
  employeeRate: 0.11,
  /** Maximum insurable monthly wage — EGP 16,700/month. */
  monthlySalaryCap: 16_700,
  annualSalaryCap: 16_700 * 12,
} as const;

/** Annual personal exemption (EGP). */
export const EG_PERSONAL_EXEMPTION_2026 = 20_000;

/** Progressive PIT brackets on taxable income after social insurance and exemption. */
export const EG_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 40_000, rate: 0 },
  { min: 40_000, max: 55_000, rate: 0.1 },
  { min: 55_000, max: 70_000, rate: 0.15 },
  { min: 70_000, max: 200_000, rate: 0.2 },
  { min: 200_000, max: 400_000, rate: 0.225 },
  { min: 400_000, max: 1_200_000, rate: 0.25 },
  { min: 1_200_000, max: Infinity, rate: 0.275 },
];
