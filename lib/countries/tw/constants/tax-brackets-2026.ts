// ============================================================================
// TAIWAN TAX CONSTANTS (2026 TAX YEAR)
// ============================================================================
// Sources:
// - National Taxation Bureau of Taipei (Progressive Tax Rates 2026):
//   https://www.ntbt.gov.tw/English/multiplehtml/3f18d2625aea4187b0d90e9b929afe4c
// - Ministry of Finance Tax Brackets and Deductions 2026:
//   https://www.ramco.com/payce/payroll-compliance-taiwan
// - Bureau of Labor Insurance (Labor Insurance Grade Tables 2026):
//   https://www.bli.gov.tw/EN/0016423.html
// - National Health Insurance (Premium Calculation 2026):
//   https://www.nhi.gov.tw/en/cp-19435-fdaba-114-2.html
// - Ministry of Labor (Labor Pension Tables 2026):
//   https://www.ramco.com/payce/payroll-compliance-taiwan
//
// Tax Year: 2026 (for income earned in 2025, filed in 2026)
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// INCOME TAX BRACKETS (Progressive Tax Rates for 2026)
// Source: National Taxation Bureau of Taipei
// ============================================================================
export const TW_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 610_000, rate: 0.05 },          // 5% on 0 - 610,000
  { min: 610_001, max: 1_380_000, rate: 0.12 },  // 12% on 610,001 - 1,380,000
  { min: 1_380_001, max: 2_770_000, rate: 0.20 }, // 20% on 1,380,001 - 2,770,000
  { min: 2_770_001, max: 5_190_000, rate: 0.30 }, // 30% on 2,770,001 - 5,190,000
  { min: 5_190_001, max: Infinity, rate: 0.40 },  // 40% on 5,190,001+
];

// Progressive differences for tax calculation (alternative formula)
// Tax = Taxable Income × Rate - Progressive Difference
export const TW_PROGRESSIVE_DIFFERENCES_2026 = {
  bracket1: 0,        // 5% bracket
  bracket2: 42_700,   // 12% bracket
  bracket3: 153_100,  // 20% bracket
  bracket4: 430_100,  // 30% bracket
  bracket5: 949_100,  // 40% bracket
};

// ============================================================================
// PERSONAL EXEMPTIONS AND DEDUCTIONS (2026)
// Source: Ministry of Finance (Nov 27, 2025 announcement)
// ============================================================================
export const TW_EXEMPTIONS_2026 = {
  // Personal exemptions
  personal: 101_000,           // General personal exemption
  personalElderly: 151_500,    // For taxpayers/parents aged 70+
};

export const TW_STANDARD_DEDUCTION_2026 = {
  single: 136_000,      // Single, divorced, or widowed
  married: 272_000,     // Married (joint filing)
};

export const TW_SPECIAL_DEDUCTIONS_2026 = {
  salary: 227_000,      // Special deduction for salary/wage income
  disability: 227_000,  // Special deduction for disabled individuals
};

// ============================================================================
// LABOR INSURANCE (勞工保險) - 2026
// Source: Bureau of Labor Insurance, Ministry of Labor
// ============================================================================
export const TW_LABOR_INSURANCE_2026 = {
  // Total premium rate: 11.5% (ordinary insurance) + 1% (employment insurance) = 12.5%
  // For calculation purposes, we use 11.5% for the main labor insurance
  totalRate: 0.115,           // 11.5% (ordinary risk insurance)
  employeeShare: 0.20,        // Employee pays 20% of premium
  employerShare: 0.70,        // Employer pays 70% of premium
  governmentShare: 0.10,      // Government pays 10% of premium
  monthlyWageCap: 45_800,     // Maximum insured salary (monthly)
  // Employee effective rate: 11.5% × 20% = 2.3%
  employeeEffectiveRate: 0.023, // 11.5% × 20%
};

// ============================================================================
// EMPLOYMENT INSURANCE (就業保險) - 2026
// Source: Bureau of Labor Insurance, Ministry of Labor
// ============================================================================
export const TW_EMPLOYMENT_INSURANCE_2026 = {
  rate: 0.01,             // 1% of insured salary
  employeeShare: 0.20,    // Employee pays 20% (0.2%)
  employerShare: 0.70,    // Employer pays 70% (0.7%)
  governmentShare: 0.10,  // Government pays 10% (0.1%)
  monthlyWageCap: 45_800, // Same cap as labor insurance
  // Employee effective rate: 1% × 20% = 0.2%
  employeeEffectiveRate: 0.002,
};

// Combined Labor Insurance + Employment Insurance
export const TW_COMBINED_INSURANCE_2026 = {
  totalRate: 0.125,              // 11.5% + 1% = 12.5%
  employeeEffectiveRate: 0.025,  // 2.3% + 0.2% = 2.5%
  monthlyWageCap: 45_800,
};

// ============================================================================
// NATIONAL HEALTH INSURANCE (全民健康保險) - 2026
// Source: National Health Insurance Administration
// ============================================================================
export const TW_NHI_2026 = {
  premiumRate: 0.0517,      // 5.17% since January 1, 2021
  employeeShare: 0.30,      // Employee pays 30%
  employerShare: 0.60,      // Employer pays 60%
  governmentShare: 0.10,    // Government pays 10%
  monthlyWageCap: 313_000,  // Maximum insured salary (monthly)
  // Employee effective rate: 5.17% × 30% = 1.551%
  employeeEffectiveRate: 0.01551,
  // Dependent factor for employer calculation (average 0.56 as of 2024)
  averageDependentFactor: 0.56,
};

// NHI Supplementary Premium (on bonuses exceeding 4× monthly salary)
export const TW_NHI_SUPPLEMENTARY_2026 = {
  rate: 0.0211,           // 2.11% on bonus/irregular income
  thresholdMultiplier: 4, // Bonus exceeding 4× monthly insured salary
  // Cap: 4 × monthly capped salary × 2.11%
  // Max monthly cap for calculation: 313,000 × 4 = 1,252,000
  monthlyCap: 1_252_000,
};

// ============================================================================
// LABOR PENSION (勞工退休金) - New Pension System 2026
// Source: Bureau of Labor Funds, Ministry of Labor
// Note: This is employer-funded (6%), employee contribution is voluntary
// ============================================================================
export const TW_LABOR_PENSION_2026 = {
  employerContributionRate: 0.06,  // Employer mandatory: 6%
  employeeVoluntaryMaxRate: 0.06,  // Employee can contribute 0-6% voluntarily
  monthlyWageCap: 150_000,         // Maximum contribution base
  monthlyWageFloor: 29_500,        // Minimum wage as of Jan 2026
};

// ============================================================================
// TAX CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Taiwan progressive income tax
 * Using the formula: Tax = Taxable Income × Rate - Progressive Difference
 * Or bracket-by-bracket calculation
 */
export function calculateProgressiveTax(taxableIncome: number): {
  totalTax: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }> = [];

  for (const bracket of TW_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.min) {
      bracketTaxes.push({
        min: bracket.min,
        max: bracket.max,
        rate: bracket.rate,
        tax: 0,
      });
      continue;
    }

    const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    const taxAtBracket = taxableAtBracket * bracket.rate;
    totalTax += taxAtBracket;

    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: taxAtBracket,
    });
  }

  return { totalTax: Math.round(totalTax), bracketTaxes };
}

/**
 * Calculate Labor Insurance contribution (employee portion)
 */
export function calculateLaborInsurance(monthlySalary: number): number {
  const insuredSalary = Math.min(monthlySalary, TW_LABOR_INSURANCE_2026.monthlyWageCap);
  return Math.round(insuredSalary * TW_LABOR_INSURANCE_2026.employeeEffectiveRate);
}

/**
 * Calculate Employment Insurance contribution (employee portion)
 */
export function calculateEmploymentInsurance(monthlySalary: number): number {
  const insuredSalary = Math.min(monthlySalary, TW_EMPLOYMENT_INSURANCE_2026.monthlyWageCap);
  return Math.round(insuredSalary * TW_EMPLOYMENT_INSURANCE_2026.employeeEffectiveRate);
}

/**
 * Calculate National Health Insurance contribution (employee portion)
 */
export function calculateNHI(monthlySalary: number): number {
  const insuredSalary = Math.min(monthlySalary, TW_NHI_2026.monthlyWageCap);
  return Math.round(insuredSalary * TW_NHI_2026.employeeEffectiveRate);
}

/**
 * Calculate total social insurance contributions (employee portion, monthly)
 */
export function calculateSocialInsurance(monthlySalary: number): {
  laborInsurance: number;
  employmentInsurance: number;
  nhi: number;
  total: number;
} {
  const laborInsurance = calculateLaborInsurance(monthlySalary);
  const employmentInsurance = calculateEmploymentInsurance(monthlySalary);
  const nhi = calculateNHI(monthlySalary);

  return {
    laborInsurance,
    employmentInsurance,
    nhi,
    total: laborInsurance + employmentInsurance + nhi,
  };
}
