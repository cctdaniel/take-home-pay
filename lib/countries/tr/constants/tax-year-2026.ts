// Turkey 2026 income tax and social security model.
// Sources:
// - GİB: Progressive income tax rates (Article 103)
// - SGK: Social security 14% employee, 1% unemployment
// - Ceiling: ~TRY 130,550/month for SSI base (2026 estimate)

import type { TaxBracket } from "../../types";

export const TR_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 158_000, rate: 0.15 },
  { min: 158_000, max: 330_000, rate: 0.2 },
  { min: 330_000, max: 1_200_000, rate: 0.27 },
  { min: 1_200_000, max: 4_300_000, rate: 0.35 },
  { min: 4_300_000, max: Infinity, rate: 0.4 },
];

export const TR_SOCIAL_SECURITY_2026 = {
  employeeSSIRate: 0.14,
  employeeUnemploymentRate: 0.01,
  maxMonthlyBase: 130_550,
} as const;

export function calculateTRProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = TR_INCOME_TAX_BRACKETS_2026.map((b) => {
    const amt = Math.max(0, Math.min(taxableIncome, b.max) - b.min);
    return { ...b, tax: amt * b.rate };
  }).filter((b) => b.tax > 0);
  const totalTax = bracketTaxes.reduce((s, b) => s + b.tax, 0);
  return { totalTax, bracketTaxes };
}
