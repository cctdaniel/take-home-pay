// Brazil 2026 income tax and INSS model.
// Sources:
// - Receita Federal: Progressive IRPF table
// - INSS contribution table 2026
// - Standard deduction: simplified 20% of gross (limited to R$ 16,754.34)

import type { TaxBracket } from "../../types";

export const BR_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 27_110.40, rate: 0 },
  { min: 27_110.40, max: 40_665.60, rate: 0.075 },
  { min: 40_665.60, max: 54_266.40, rate: 0.15 },
  { min: 54_266.40, max: 67_833.60, rate: 0.225 },
  { min: 67_833.60, max: Infinity, rate: 0.275 },
];

export const BR_INSS_2026 = {
  maxMonthlyBase: 8_157.41,
  brackets: [
    { max: 1_518.00, rate: 0.075 },
    { max: 2_793.88, rate: 0.09 },
    { max: 4_190.83, rate: 0.12 },
    { max: 8_157.41, rate: 0.14 },
  ],
} as const;

export const BR_SIMPLIFIED_DEDUCTION_LIMIT = 16_754.34;
export const BR_SIMPLIFIED_DEDUCTION_RATE = 0.2;

export function calculateBRProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = BR_INCOME_TAX_BRACKETS_2026.map((b) => {
    const amt = Math.max(0, Math.min(taxableIncome, b.max) - b.min);
    return { ...b, tax: amt * b.rate };
  }).filter((b) => b.tax > 0 || b.rate === 0);
  const totalTax = bracketTaxes.reduce((s, b) => s + b.tax, 0);
  return { totalTax, bracketTaxes };
}

export function calculateBRINSS(monthlySalary: number) {
  let remaining = monthlySalary;
  let total = 0;
  for (const bracket of BR_INSS_2026.brackets) {
    const taxableInBracket = Math.min(remaining, bracket.max);
    total += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
    if (remaining <= 0) break;
  }
  return total;
}
