// Israel 2026 income tax and social security model.
// Sources:
// - Tax Authority: Progressive tax brackets
// - Bituach Leumi: National Insurance + Health Insurance rates

import type { TaxBracket } from "../../types";

export const IL_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 84_120, rate: 0.1 },
  { min: 84_120, max: 120_720, rate: 0.14 },
  { min: 120_720, max: 193_800, rate: 0.2 },
  { min: 193_800, max: 269_280, rate: 0.31 },
  { min: 269_280, max: 560_280, rate: 0.35 },
  { min: 560_280, max: 721_560, rate: 0.47 },
  { min: 721_560, max: Infinity, rate: 0.5 },
];

export const IL_NATIONAL_INSURANCE_2026 = {
  maxMonthlyBase: 49_030,
  employeeRates: {
    upTo60Percent: 0.004,
    above60Percent: 0.07,
    threshold: 7_122,
  },
  healthInsuranceRates: {
    upTo60Percent: 0.031,
    above60Percent: 0.05,
    threshold: 7_122,
  },
} as const;

export function calculateILProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = IL_INCOME_TAX_BRACKETS_2026.map((b) => {
    const amt = Math.max(0, Math.min(taxableIncome, b.max) - b.min);
    return { ...b, tax: amt * b.rate };
  }).filter((b) => b.tax > 0);
  const totalTax = bracketTaxes.reduce((s, b) => s + b.tax, 0);
  return { totalTax, bracketTaxes };
}

export function calculateILBituachLeumi(monthlySalary: number) {
  const maxBase = IL_NATIONAL_INSURANCE_2026.maxMonthlyBase;
  const cappedMonthly = Math.min(monthlySalary, maxBase);
  const threshold = IL_NATIONAL_INSURANCE_2026.employeeRates.threshold;
  const lower = Math.min(cappedMonthly, threshold);
  const upper = Math.max(0, cappedMonthly - threshold);
  const nationalInsurance = lower * IL_NATIONAL_INSURANCE_2026.employeeRates.upTo60Percent +
    upper * IL_NATIONAL_INSURANCE_2026.employeeRates.above60Percent;
  const healthInsurance = lower * IL_NATIONAL_INSURANCE_2026.healthInsuranceRates.upTo60Percent +
    upper * IL_NATIONAL_INSURANCE_2026.healthInsuranceRates.above60Percent;
  return { nationalInsurance, healthInsurance };
}
