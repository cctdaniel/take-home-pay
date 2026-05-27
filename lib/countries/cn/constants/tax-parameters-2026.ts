import type { TaxBracket } from "../../types";

export const CN_SOURCE_URLS = [
  "https://www.chinatax.gov.cn/eng/c102962/c102967/c102997/c103004/c5245849/content.html",
  "https://12366.chinatax.gov.cn/bzds/076/076-5-2.html",
  "https://www.chinatax.gov.cn/eng/c102962/c102967/c102997/c103004/c5242641/content.html",
  "https://anhui.chinatax.gov.cn/art/2023/8/18/art_23661_1134633.html",
  "https://www.sc.gov.cn/10462/10778/10876/2023/9/25/677155c779d747b2b8374d249a17aa1e.shtml",
  "https://www.gov.cn/zhengce/content/202308/content_6900595.htm",
  "https://www.chinatax.gov.cn/chinatax/n810341/n810760/c5183237/content.html",
  "https://www.chinatax.gov.cn/chinatax/n810341/n810765/n812146/n812300/c1079953/content.html",
  "https://12366.chinatax.gov.cn/bzds/pdfview/pdf/071-2-2.pdf",
  "https://jiangsu.chinatax.gov.cn/art/2023/11/10/art_9280_439902.html",
  "https://www.chinatax.gov.cn/chinatax/c102152/c5178885/content.html",
] as const;

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
  // Elderly care: 3,000/month total for only child, up to 1,500/month total for non-only child share
  elderlyCareOnlyChild: 3_000,
  elderlyCareShared: 1_500,
  // Housing rent by city tier
  housingRentTier1: 1_500, // Tier 1 cities
  housingRentTier2: 1_100, // Cities with pop > 1M
  housingRentTier3: 800, // Other cities
  housingLoanInterest: 1_000, // First home mortgage interest
  continuingEducation: 400, // Degree continuing education, per month
  professionalQualificationEducation: 3_600, // Eligible professional qualification certificate year
} as const;

// Other resident IIT deductions and user-controlled relief inputs
export const CN_ENTERPRISE_ANNUITY_DEDUCTION_RATE = 0.04;
export const CN_INDIVIDUAL_PENSION_DEDUCTION_ANNUAL_CAP = 12_000;
export const CN_TAX_PREFERRED_HEALTH_INSURANCE_ANNUAL_CAP = 2_400;
export const CN_CHARITABLE_DONATION_DEDUCTION_RATE_LIMIT = 0.3;
export const CN_MAJOR_ILLNESS_MEDICAL_THRESHOLD = 15_000;
export const CN_MAJOR_ILLNESS_MEDICAL_ANNUAL_CAP = 80_000;

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

export function calculateCNSeparateYearEndBonusTax(bonusAmount: number): {
  totalTax: number;
  taxableIncome: number;
  rate: number;
  quickDeduction: number;
} {
  const taxableIncome = Math.max(0, bonusAmount);

  if (taxableIncome <= 0) {
    return { totalTax: 0, taxableIncome: 0, rate: 0, quickDeduction: 0 };
  }

  const monthlyEquivalent = taxableIncome / 12;
  const bracket =
    CN_TAX_BRACKETS_2026.find(
      (candidate) =>
        monthlyEquivalent > candidate.min / 12 &&
        monthlyEquivalent <= candidate.max / 12
    ) ?? CN_TAX_BRACKETS_2026[CN_TAX_BRACKETS_2026.length - 1];
  const quickDeduction = bracket.quickDeduction / 12;
  const totalTax = Math.max(
    0,
    taxableIncome * bracket.rate - quickDeduction
  );

  return {
    totalTax: Math.round(totalTax * 100) / 100,
    taxableIncome,
    rate: bracket.rate,
    quickDeduction,
  };
}
