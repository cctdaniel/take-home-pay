import type { TaxBracket } from "../../types";

// Social insurance contribution rates and ceilings (2026)
export const CN_SOCIAL_INSURANCE_2026 = {
  pension: {
    employeeRate: 0.08,
    employerRate: 0.16,
    // Ceilings vary by city - using common caps: 3x local average monthly salary
    // National guidance: monthly ceiling ~ 3x average monthly salary of the city
    monthlyCeiling: 36_000, // Approximate upper bound for Tier 1 cities
  },
  medical: {
    employeeRate: 0.02,
    employerRate: 0.08,
    monthlyCeiling: 36_000,
  },
  unemployment: {
    employeeRate: 0.005,
    employerRate: 0.005,
    monthlyCeiling: 36_000,
  },
} as const;

// Housing fund rate bounds
export const CN_HOUSING_FUND_2026 = {
  minRate: 0.05,
  maxRate: 0.12,
} as const;

// Individual Income Tax brackets (7 brackets, 2026)
// Each bracket has: min, max, rate, quickDeduction (速算扣除数)
export const CN_TAX_BRACKETS_2026: Array<
  TaxBracket & { quickDeduction: number }
> = [
  { min: 0, max: 36_000, rate: 0.03, quickDeduction: 0 },
  { min: 36_000, max: 144_000, rate: 0.10, quickDeduction: 2_520 },
  { min: 144_000, max: 300_000, rate: 0.20, quickDeduction: 16_920 },
  { min: 300_000, max: 420_000, rate: 0.25, quickDeduction: 31_920 },
  { min: 420_000, max: 660_000, rate: 0.30, quickDeduction: 52_920 },
  { min: 660_000, max: 960_000, rate: 0.35, quickDeduction: 85_920 },
  { min: 960_000, max: Infinity, rate: 0.45, quickDeduction: 181_920 },
];

// Standard basic deduction: 60,000 CNY/year (5,000/month)
export const CN_STANDARD_DEDUCTION = 60_000;

// Special additional deductions (专项附加扣除) - monthly amounts
export const CN_SPECIAL_DEDUCTIONS_2026 = {
  childEducation: 2_000, // per child/month (age 3+)
  childUnder3: 2_000, // per child/month (under 3)
  // Elderly care: 3,000/month for only child, up to 1,500 for non-only child
  elderlyCareOnlyChild: 3_000,
  elderlyCareShared: 1_500,
  // Housing rent by city tier
  housingRentTier1: 1_500, // Tier 1 cities
  housingRentTier2: 1_100, // Cities with pop > 1M
  housingRentTier3: 800, // Other cities
  housingLoanInterest: 1_000, // First home mortgage interest
  continuingEducation: 400, // Self continuing education
} as const;

export function calculateCNProgressiveTax(
  annualTaxableIncome: number
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
    quickDeduction: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
    quickDeduction: number;
  }> = [];

  for (const bracket of CN_TAX_BRACKETS_2026) {
    if (annualTaxableIncome <= 0) break;

    const amountInBracket = Math.min(annualTaxableIncome, bracket.max) - bracket.min;
    if (amountInBracket <= 0) continue;

    const tax = amountInBracket * bracket.rate;
    totalTax += tax;

    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax * 100) / 100,
      quickDeduction: bracket.quickDeduction,
    });
  }

  return {
    totalTax: Math.round(totalTax * 100) / 100,
    bracketTaxes,
  };
}

// Personal pension account (个人养老金)
// https://www.gov.cn/zhengce/zhengceku/202412/content_6992498.htm
export const CN_PRIVATE_PENSION_ANNUAL_CAP_2026 = 12_000;
export const CN_SOURCE_URLS = {
  privatePension: "https://www.gov.cn/zhengce/zhengceku/202412/content_6992498.htm",
} as const;
