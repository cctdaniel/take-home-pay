import type { TaxBracket } from "../../types";

// Morocco salary tax parameters — 2026
// Sources: https://www.tax.gov.ma/

export const MA_TAX_YEAR = 2026;

export const MA_SOURCE_URLS = {
  incomeTax: "https://www.tax.gov.ma/",
  socialInsurance: "https://www.tax.gov.ma/",
} as const;

/** CNSS employee contribution — 4.48% capped at MAD 6,000/month. */
export const MA_CNSS_2026 = {
  employeeRate: 0.0448,
  monthlySalaryCap: 6_000,
} as const;

/** AMO employee contribution — 2.26% uncapped on gross. */
export const MA_AMO_2026 = {
  employeeRate: 0.0226,
} as const;

/** Professional expense deduction — 20% of (gross − social), capped annually. */
export const MA_PROFESSIONAL_EXPENSES_2026 = {
  rate: 0.2,
  annualCap: 30_000,
} as const;

/** Dependent tax credit — MAD 600/year per dependent, capped at MAD 3,600. */
// Source: https://www.finances.gov.ma/Publication/dgi/2025/note-synthetique-mesures-fiscalesLF20265.pdf
export const MA_DEPENDENT_CREDIT_2026 = {
  annualCreditPerDependent: 600,
  annualCap: 3_600,
  maxDependents: 6,
} as const;

/** Supplementary retirement (e.g. CIMR) — deductible up to 50% of net taxable salary. */
// Source: https://www.tax.gov.ma/ — CGI art. 28-III / art. 59
export const MA_SUPPLEMENTARY_PENSION_MAX_NET_SALARY_RATE = 0.5;

/** Progressive IR brackets on net taxable income (annual MAD). */
export const MA_IR_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 40_000, rate: 0 },
  { min: 40_000, max: 60_000, rate: 0.1 },
  { min: 60_000, max: 80_000, rate: 0.2 },
  { min: 80_000, max: 100_000, rate: 0.3 },
  { min: 100_000, max: 180_000, rate: 0.34 },
  { min: 180_000, max: Infinity, rate: 0.37 },
];

export function calculateMaSocialContributions(grossSalary: number): {
  cnss: number;
  amo: number;
  total: number;
} {
  const gross = Math.max(0, grossSalary);
  const monthlyGross = gross / 12;
  const cnssMonthlyBase = Math.min(monthlyGross, MA_CNSS_2026.monthlySalaryCap);
  const cnss = Math.round(cnssMonthlyBase * MA_CNSS_2026.employeeRate * 12 * 100) / 100;
  const amo = Math.round(gross * MA_AMO_2026.employeeRate * 100) / 100;
  return {
    cnss,
    amo,
    total: Math.round((cnss + amo) * 100) / 100,
  };
}

export function calculateMaProfessionalExpenseDeduction(
  grossSalary: number,
  socialContributions: number,
): number {
  const base = Math.max(0, grossSalary - socialContributions);
  return Math.min(
    Math.round(base * MA_PROFESSIONAL_EXPENSES_2026.rate * 100) / 100,
    MA_PROFESSIONAL_EXPENSES_2026.annualCap,
  );
}

export function calculateMaDependentCredit(dependents: number): number {
  const count = Math.min(
    Math.max(0, dependents),
    MA_DEPENDENT_CREDIT_2026.maxDependents,
  );
  return Math.min(
    count * MA_DEPENDENT_CREDIT_2026.annualCreditPerDependent,
    MA_DEPENDENT_CREDIT_2026.annualCap,
  );
}
