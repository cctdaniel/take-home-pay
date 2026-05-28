import type { TaxBracket } from "../../types";

// Turkey salary model — tax year 2026 (GVK + SGK).
// Sources:
// - GIB income tax: https://www.gib.gov.tr/

/** 2026 gross minimum wage annual exemption (TRY 26,005/month × 12, GVK). */
export const TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026 = 26_005 * 12;

export const TR_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 158_000, rate: 0.15 },
  { min: 158_000, max: 330_000, rate: 0.2 },
  { min: 330_000, max: 800_000, rate: 0.27 },
  { min: 800_000, max: 4_300_000, rate: 0.35 },
  { min: 4_300_000, max: Infinity, rate: 0.4 },
];

/** BES private pension — employee contribution up to 3% of gross. */
export const TR_BES_MAX_GROSS_RATE = 0.03;

/** Income tax credit equals 30% of BES contribution, capped at income tax due. */
export const TR_BES_TAX_CREDIT_RATE = 0.3;

export const TR_SOCIAL_2026 = {
  sgkEmployeeRate: 0.14,
  unemploymentEmployeeRate: 0.01,
  /** Monthly SGK premium ceiling (2026 payroll). */
  monthlySgkCeiling: 195_041.25,
} as const;

export const TR_SOURCE_URLS = ["https://www.gib.gov.tr/"] as const;

export function calculateTrProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = TR_INCOME_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(taxableIncome, bracket.max) - bracket.min,
    );
    return { ...bracket, tax: taxableAmount * bracket.rate };
  });
  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);
  return {
    totalTax: Math.round(totalTax * 100) / 100,
    bracketTaxes,
  };
}

export function calculateTrSgkBase(grossSalary: number): number {
  const monthlyGross = grossSalary / 12;
  const cappedMonthly = Math.min(
    monthlyGross,
    TR_SOCIAL_2026.monthlySgkCeiling,
  );
  return Math.round(cappedMonthly * 12 * 100) / 100;
}
