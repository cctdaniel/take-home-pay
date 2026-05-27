// Poland 2026 tax and social security model.
// Sources:
// - Ministry of Finance: Progressive tax scale 12%/32%
// - Tax-free amount: PLN 60,000
// - ZUS social security: pension 9.76% + disability 1.5% + sickness 2.45% = 13.71%
// - NFZ health insurance: 9%

import type { TaxBracket } from "../../types";

export const PL_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 120_000, rate: 0.12 },
  { min: 120_000, max: Infinity, rate: 0.32 },
];

export const PL_TAX_FREE_AMOUNT = 30_000;

export const PL_SOCIAL_SECURITY_2026 = {
  employeePensionRate: 0.0976,
  employeeDisabilityRate: 0.015,
  employeeSicknessRate: 0.0245,
  maxAnnualBase: 234_720,
} as const;

export const PL_TOTAL_SOCIAL_RATE =
  PL_SOCIAL_SECURITY_2026.employeePensionRate +
  PL_SOCIAL_SECURITY_2026.employeeDisabilityRate +
  PL_SOCIAL_SECURITY_2026.employeeSicknessRate;

export const PL_HEALTH_INSURANCE_RATE = 0.09;

export function calculatePLProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = PL_INCOME_TAX_BRACKETS_2026.map((b) => {
    const amt = Math.max(0, Math.min(taxableIncome, b.max) - b.min);
    return { ...b, tax: amt * b.rate };
  }).filter((b) => b.tax > 0);
  const totalTax = bracketTaxes.reduce((s, b) => s + b.tax, 0);
  return { totalTax, bracketTaxes };
}
