// South Africa 2026/27 tax year model.
// Sources:
// - SARS: Progressive tax brackets (2026 tax year)
// - UIF: 1% employee contribution on earnings up to ZAR 212,544/year
// - Tax rebates: Primary ZAR 17,235

import type { TaxBracket } from "../../types";

export const ZA_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 237_100, rate: 0.18 },
  { min: 237_100, max: 370_500, rate: 0.26 },
  { min: 370_500, max: 512_800, rate: 0.31 },
  { min: 512_800, max: 673_000, rate: 0.36 },
  { min: 673_000, max: 857_900, rate: 0.39 },
  { min: 857_900, max: 1_817_000, rate: 0.41 },
  { min: 1_817_000, max: Infinity, rate: 0.45 },
];

export const ZA_TAX_REBATES_2026 = {
  primary: 17_235,
  secondary: 9_444,
  tertiary: 3_145,
  secondaryAgeThreshold: 65,
  tertiaryAgeThreshold: 75,
} as const;

export const ZA_UIF_2026 = {
  employeeRate: 0.01,
  maxAnnualEarnings: 212_544,
} as const;

export function calculateZAProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = ZA_INCOME_TAX_BRACKETS_2026.map((b) => {
    const amt = Math.max(0, Math.min(taxableIncome, b.max) - b.min);
    return { ...b, tax: amt * b.rate };
  }).filter((b) => b.tax > 0);
  const totalTax = bracketTaxes.reduce((s, b) => s + b.tax, 0);
  return { totalTax, bracketTaxes };
}
