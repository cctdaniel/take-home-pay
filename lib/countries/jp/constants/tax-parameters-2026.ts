import type { TaxBracket } from "../../types";

// Social insurance rates (2026)
export const JP_SOCIAL_INSURANCE_2026 = {
  pension: {
    employeeRate: 0.0915, // 9.15%
    employerRate: 0.0915,
    monthlyCeiling: 650_000, // Standard monthly remuneration ceiling
    minMonthlyBase: 88_000, // Minimum monthly remuneration
  },
  health: {
    // Varies by prefecture/association - using national average
    employeeRate: 0.05, // ~5% (varies 4.5%-5.5%)
    employerRate: 0.05,
    monthlyCeiling: 1_390_000, // Health insurance ceiling (higher than pension)
  },
  employment: {
    employeeRate: 0.006, // 0.6% (general industry)
    employerRate: 0.006,
  },
} as const;

// National income tax brackets (7 brackets) with deductions
// From: https://www.nta.go.jp/english/taxes/individual/
export const JP_TAX_BRACKETS_2026: Array<
  TaxBracket & { deduction: number }
> = [
  { min: 0, max: 1_950_000, rate: 0.05, deduction: 0 },
  { min: 1_950_000, max: 3_300_000, rate: 0.10, deduction: 97_500 },
  { min: 3_300_000, max: 6_950_000, rate: 0.20, deduction: 427_500 },
  { min: 6_950_000, max: 9_000_000, rate: 0.23, deduction: 636_000 },
  { min: 9_000_000, max: 18_000_000, rate: 0.33, deduction: 1_536_000 },
  { min: 18_000_000, max: 40_000_000, rate: 0.40, deduction: 2_796_000 },
  { min: 40_000_000, max: Infinity, rate: 0.45, deduction: 4_796_000 },
];

// Basic deduction (基礎控除): 480,000 JPY for income <= 24,000,000
export const JP_BASIC_DEDUCTION = 480_000;

// Reconstruction surtax rate: 2.1% of national income tax
export const JP_RECONSTRUCTION_SURTAX_RATE = 0.021;

// Resident tax (住民税): 10% flat (4% prefectural + 6% municipal)
export const JP_RESIDENT_TAX_RATE = 0.10;
// Per-capita resident tax (flat amount)
export const JP_RESIDENT_TAX_PER_CAPITA = 5_000;

// Employment income deduction (給与所得控除) - progressive
export function calculateJPEmploymentIncomeDeduction(
  grossSalary: number
): number {
  if (grossSalary <= 1_625_000) {
    return 550_000;
  }
  if (grossSalary <= 1_800_000) {
    return grossSalary * 0.4 - 100_000;
  }
  if (grossSalary <= 3_600_000) {
    return grossSalary * 0.3 + 80_000;
  }
  if (grossSalary <= 6_600_000) {
    return grossSalary * 0.2 + 440_000;
  }
  if (grossSalary <= 8_500_000) {
    return grossSalary * 0.1 + 1_100_000;
  }
  // Cap at 1,950,000 for income above 8,500,000
  return Math.min(grossSalary * 0.1 + 1_100_000, 1_950_000);
}

export function calculateJPProgressiveTax(
  taxableIncome: number
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
    deduction: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
    deduction: number;
  }> = [];

  for (const bracket of JP_TAX_BRACKETS_2026) {
    if (taxableIncome <= 0) break;

    const amountInBracket =
      Math.min(taxableIncome, bracket.max) - bracket.min;
    if (amountInBracket <= 0) continue;

    const tax = amountInBracket * bracket.rate;
    totalTax += tax;

    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax),
      deduction: bracket.deduction,
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}

export const JP_IDECO_ANNUAL_CAP_WITH_EMPLOYER_PENSION_2026 = 240_000;
export const JP_SOURCE_URLS = {
  ideco: "https://www.keisan.nta.go.jp/r7yokuaru_sp/scat2/scat22/scat223/scid112.html",
} as const;
