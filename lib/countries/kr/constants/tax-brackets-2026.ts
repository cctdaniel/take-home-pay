// ============================================================================
// 2026 SOUTH KOREA INCOME TAX BRACKETS AND SOCIAL INSURANCE RATES
// Source: National Tax Service of Korea (NTS)
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// SOUTH KOREA INCOME TAX BRACKETS (2026)
// Progressive tax system with 8 brackets
// ============================================================================
export const KR_INCOME_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 14000000, rate: 0.06 },              // Up to ₩14M: 6%
  { min: 14000000, max: 50000000, rate: 0.15 },       // ₩14M - ₩50M: 15%
  { min: 50000000, max: 88000000, rate: 0.24 },       // ₩50M - ₩88M: 24%
  { min: 88000000, max: 150000000, rate: 0.35 },      // ₩88M - ₩150M: 35%
  { min: 150000000, max: 300000000, rate: 0.38 },     // ₩150M - ₩300M: 38%
  { min: 300000000, max: 500000000, rate: 0.40 },     // ₩300M - ₩500M: 40%
  { min: 500000000, max: 1000000000, rate: 0.42 },    // ₩500M - ₩1B: 42%
  { min: 1000000000, max: Infinity, rate: 0.45 },     // Above ₩1B: 45%
];

// Local Income Tax is 10% of National Income Tax
export const KR_LOCAL_TAX_RATE = 0.10;

// ============================================================================
// SOCIAL INSURANCE RATES (2026)
// These are the employee's share (employer pays matching amounts for most)
// ============================================================================
export const KR_SOCIAL_INSURANCE = {
  // National Pension (국민연금)
  // Total 9%, split 4.5% employee + 4.5% employer
  nationalPension: {
    employeeRate: 0.045, // 4.5%
    employerRate: 0.045, // 4.5%
    // Monthly standard income ceiling (updated annually)
    monthlyCeiling: 5900000, // ₩5.9M/month (₩70.8M annually)
    // Monthly standard income floor
    monthlyFloor: 370000, // ₩370K/month
  },

  // National Health Insurance (국민건강보험)
  // Total ~7.09%, split roughly equally
  healthInsurance: {
    employeeRate: 0.03545, // 3.545%
    employerRate: 0.03545, // 3.545%
    // No ceiling - calculated on total income
  },

  // Long-term Care Insurance (장기요양보험)
  // Calculated as percentage of health insurance premium
  longTermCare: {
    rate: 0.1295, // 12.95% of health insurance premium
  },

  // Employment Insurance (고용보험)
  // Employee rate is fixed, employer rate varies by company size
  employmentInsurance: {
    employeeRate: 0.008, // 0.8% for standard employees
    employerRate: 0.008, // 0.8% (minimum, can be higher)
  },
} as const;

// ============================================================================
// TAX DEDUCTIONS AND CREDITS (2026)
// ============================================================================
export const KR_TAX_DEDUCTIONS = {
  // Basic deduction (기본공제) - ₩1.5M per taxpayer
  basicDeduction: 1500000,

  // Dependent deduction (인적공제) - ₩1.5M per dependent
  // Includes: spouse, children under 20, parents over 60, siblings
  dependentDeduction: 1500000,

  // Child deduction (자녀공제) - for children under 20 (or students under 25)
  // This is included in the dependent deduction, but we track separately
  childDeduction: 1500000,

  // Additional child deduction for children under 7 (6세 이하 추가공제)
  childUnder7Deduction: 1000000, // ₩1,000,000 per child

  // Standard deduction for wage earners (표준세액공제)
  standardTaxCredit: 130000, // ₩130,000
} as const;

// ============================================================================
// TAX CREDITS (세액공제)
// ============================================================================
export const KR_TAX_CREDITS = {
  // Child tax credit (자녀세액공제)
  // For children eligible for child deduction
  childTaxCredit: {
    firstTwo: 150000, // ₩150,000 per child for first 2 children
    thirdAndBeyond: 300000, // ₩300,000 per child for 3rd+ children
  },

  // Wage earner tax credit caps (근로소득세액공제 한도)
  wageEarnerCredit: {
    lowIncomeRate: 0.55, // 55% for tax up to ₩1.3M
    highIncomeRate: 0.30, // 30% for tax above ₩1.3M
    baseAmount: 715000, // ₩715,000 base for high income
    threshold: 1300000, // ₩1.3M threshold
    maxLowIncome: 740000, // Max ₩740,000 for gross tax ≤ ₩33M
    maxMidIncome: 660000, // Max ₩660,000 for gross tax ₩33M-70M
    maxHighIncome: 500000, // Max ₩500,000 for gross tax > ₩70M
  },

  // Standard tax credit (표준세액공제)
  standardCredit: 130000, // ₩130,000

  // Personal pension credit (연금저축/IRP 세액공제)
  pensionCredit: {
    maxContribution: 9000000, // ₩9,000,000 annual limit
    lowIncomeRate: 0.165, // 16.5% for income ≤ ₩55M
    highIncomeRate: 0.132, // 13.2% for income > ₩55M
    incomeThreshold: 55000000, // ₩55M threshold
  },
} as const;

// ============================================================================
// NON-TAXABLE ALLOWANCES (비과세 소득)
// ============================================================================
export const KR_NON_TAXABLE_ALLOWANCES = {
  // Meal allowance (식대) - ₩200,000/month not taxed
  mealAllowance: {
    monthlyLimit: 200000,
    annualLimit: 2400000, // ₩200,000 × 12
  },
  // Childcare allowance (자녀보육수당) - ₩100,000/month for children under 6
  childcareAllowance: {
    monthlyLimit: 100000,
    annualLimit: 1200000, // ₩100,000 × 12
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate employment income deduction (근로소득공제)
 * This is a tiered deduction that reduces taxable income
 */
export function calculateEmploymentIncomeDeduction(annualIncome: number): number {
  if (annualIncome <= 0) return 0;

  let deduction = 0;
  let remainingIncome = annualIncome;

  // Tier 1: Up to ₩5M at 70%
  const tier1Income = Math.min(remainingIncome, 5000000);
  deduction += tier1Income * 0.70;
  remainingIncome -= tier1Income;

  if (remainingIncome <= 0) return Math.round(deduction);

  // Tier 2: ₩5M to ₩15M at 40%
  const tier2Income = Math.min(remainingIncome, 10000000);
  deduction += tier2Income * 0.40;
  remainingIncome -= tier2Income;

  if (remainingIncome <= 0) return Math.round(deduction);

  // Tier 3: ₩15M to ₩45M at 15%
  const tier3Income = Math.min(remainingIncome, 30000000);
  deduction += tier3Income * 0.15;
  remainingIncome -= tier3Income;

  if (remainingIncome <= 0) return Math.round(deduction);

  // Tier 4: ₩45M to ₩100M at 5%
  const tier4Income = Math.min(remainingIncome, 55000000);
  deduction += tier4Income * 0.05;
  remainingIncome -= tier4Income;

  if (remainingIncome <= 0) return Math.round(deduction);

  // Tier 5: Above ₩100M at 2%
  deduction += remainingIncome * 0.02;

  // Apply maximum cap (₩20M for incomes above ₩100M)
  if (annualIncome > 100000000) {
    deduction = Math.min(deduction, 20000000);
  }

  return Math.round(deduction);
}

/**
 * Calculate progressive income tax using Korean tax brackets
 */
export function calculateProgressiveIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;

  for (const bracket of KR_INCOME_TAX_BRACKETS) {
    if (taxableIncome <= bracket.min) break;

    const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += incomeInBracket * bracket.rate;
  }

  return Math.round(tax);
}

/**
 * Calculate National Pension contribution
 */
export function calculateNationalPension(monthlyIncome: number): number {
  const { employeeRate, monthlyCeiling, monthlyFloor } = KR_SOCIAL_INSURANCE.nationalPension;

  // Apply floor and ceiling to standard monthly income
  const standardIncome = Math.max(monthlyFloor, Math.min(monthlyIncome, monthlyCeiling));

  return Math.round(standardIncome * employeeRate);
}

/**
 * Calculate National Health Insurance contribution
 */
export function calculateHealthInsurance(monthlyIncome: number): number {
  const { employeeRate } = KR_SOCIAL_INSURANCE.healthInsurance;
  return Math.round(monthlyIncome * employeeRate);
}

/**
 * Calculate Long-term Care Insurance contribution
 * Based on health insurance premium
 */
export function calculateLongTermCare(healthInsurancePremium: number): number {
  const { rate } = KR_SOCIAL_INSURANCE.longTermCare;
  return Math.round(healthInsurancePremium * rate);
}

/**
 * Calculate Employment Insurance contribution
 */
export function calculateEmploymentInsurance(monthlyIncome: number): number {
  const { employeeRate } = KR_SOCIAL_INSURANCE.employmentInsurance;
  return Math.round(monthlyIncome * employeeRate);
}

/**
 * Calculate wage earner tax credit (근로소득세액공제)
 * Credit is based on calculated tax amount
 */
export function calculateWageEarnerTaxCredit(calculatedTax: number): number {
  if (calculatedTax <= 0) return 0;

  let credit = 0;

  if (calculatedTax <= 1300000) {
    // Up to ₩1.3M: 55% credit
    credit = calculatedTax * 0.55;
  } else {
    // Above ₩1.3M: ₩715,000 + 30% of excess
    credit = 715000 + (calculatedTax - 1300000) * 0.30;
  }

  // Apply maximum caps
  if (calculatedTax <= 33000000) {
    credit = Math.min(credit, 740000); // Max ₩740,000 for income up to ₩33M
  } else if (calculatedTax <= 70000000) {
    credit = Math.min(credit, 660000); // Max ₩660,000 for income ₩33M-70M
  } else {
    credit = Math.min(credit, 500000); // Max ₩500,000 for income above ₩70M
  }

  return Math.round(credit);
}

/**
 * Calculate child tax credit (자녀세액공제)
 * First 2 children: ₩150,000 each
 * 3rd child and beyond: ₩300,000 each
 */
export function calculateChildTaxCredit(numberOfChildren: number): number {
  if (numberOfChildren <= 0) return 0;

  const { firstTwo, thirdAndBeyond } = KR_TAX_CREDITS.childTaxCredit;

  if (numberOfChildren <= 2) {
    return numberOfChildren * firstTwo;
  }

  // First 2 children at ₩150,000 + additional children at ₩300,000
  const additionalChildren = numberOfChildren - 2;
  return (2 * firstTwo) + (additionalChildren * thirdAndBeyond);
}

/**
 * Calculate personal pension credit (연금저축/IRP 세액공제)
 * 16.5% for income ≤ ₩55M, 13.2% for income > ₩55M
 * Maximum contribution: ₩9,000,000/year
 */
export function calculatePensionCredit(contribution: number, totalIncome: number): number {
  if (contribution <= 0) return 0;

  const { maxContribution, lowIncomeRate, highIncomeRate, incomeThreshold } = KR_TAX_CREDITS.pensionCredit;

  // Cap contribution at maximum
  const cappedContribution = Math.min(contribution, maxContribution);

  // Apply rate based on income level
  const rate = totalIncome <= incomeThreshold ? lowIncomeRate : highIncomeRate;

  return Math.round(cappedContribution * rate);
}

// ============================================================================
// ADDITIONAL TAX CREDIT CALCULATIONS (2026)
// ============================================================================

/**
 * Calculate insurance premium credit (보험료 세액공제)
 * 12% of insurance premiums, capped at ₩1,000,000
 * Includes: life insurance, casualty insurance, etc.
 */
export function calculateInsuranceCredit(insurancePremiums: number): number {
  if (insurancePremiums <= 0) return 0;

  // 12% credit rate
  const creditRate = 0.12;
  // Maximum credit cap
  const maxCredit = 1000000; // ₩1,000,000

  const credit = insurancePremiums * creditRate;
  return Math.round(Math.min(credit, maxCredit));
}

/**
 * Calculate medical expense credit (의료비 세액공제)
 * 15% of medical expenses exceeding 3% of gross income
 * No cap for self/dependents with disability, otherwise capped
 */
export function calculateMedicalCredit(medicalExpenses: number, grossIncome: number): number {
  if (medicalExpenses <= 0) return 0;

  // Only expenses exceeding 3% of gross income qualify
  const threshold = grossIncome * 0.03;
  const qualifyingExpenses = Math.max(0, medicalExpenses - threshold);

  if (qualifyingExpenses <= 0) return 0;

  // 15% credit rate
  const creditRate = 0.15;

  return Math.round(qualifyingExpenses * creditRate);
}

/**
 * Calculate education expense credit (교육비 세액공제)
 * 15% of education expenses
 * Different caps apply: preschool ₩3M, K-12 ₩3M, university ₩9M per person
 * For simplicity, we use a general calculation
 */
export function calculateEducationCredit(educationExpenses: number): number {
  if (educationExpenses <= 0) return 0;

  // 15% credit rate
  const creditRate = 0.15;

  return Math.round(educationExpenses * creditRate);
}

/**
 * Calculate donation credit (기부금 세액공제)
 * 15% for donations up to ₩10,000,000
 * 30% for donations exceeding ₩10,000,000
 */
export function calculateDonationCredit(donations: number): number {
  if (donations <= 0) return 0;

  const threshold = 10000000; // ₩10M threshold

  if (donations <= threshold) {
    // 15% for first ₩10M
    return Math.round(donations * 0.15);
  } else {
    // 15% for first ₩10M + 30% for excess
    const excess = donations - threshold;
    return Math.round(threshold * 0.15 + excess * 0.30);
  }
}

/**
 * Calculate rent credit (월세 세액공제) - also known as rent tax credit
 * For renters with income below certain thresholds
 * 15% for lowest income bracket, 17% for higher bracket
 * 
 * Income thresholds (2026):
 * - Single: ₩35M or less (15%), ₩45M or less (17% reduced)
 * - Married/with dependents: ₩55M or less (15%), ₩70M or less (17% reduced)
 * 
 * Annual rent cap for credit calculation: ₩7,500,000
 */
export function calculateRentCredit(
  monthlyRent: number,
  grossIncome: number,
  hasDependents: boolean
): number {
  if (monthlyRent <= 0) return 0;

  const annualRent = monthlyRent * 12;

  // Determine credit rate based on income
  let creditRate = 0;

  if (hasDependents) {
    // Married/with dependents thresholds
    if (grossIncome <= 55000000) {
      creditRate = 0.15; // 15% for income ≤ ₩55M
    } else if (grossIncome <= 70000000) {
      creditRate = 0.17; // 17% for income ₩55M-70M (but reduced)
    } else {
      return 0; // No credit for income > ₩70M
    }
  } else {
    // Single thresholds
    if (grossIncome <= 35000000) {
      creditRate = 0.15; // 15% for income ≤ ₩35M
    } else if (grossIncome <= 45000000) {
      creditRate = 0.17; // 17% for income ₩35M-45M (but reduced)
    } else {
      return 0; // No credit for income > ₩45M
    }
  }

  // Cap annual rent for credit calculation at ₩7.5M
  const cappedRent = Math.min(annualRent, 7500000);

  return Math.round(cappedRent * creditRate);
}

/**
 * Calculate non-taxable allowances (비과세 소득)
 * Returns the total annual non-taxable amount
 */
export function calculateNonTaxableAllowances(
  hasMealAllowance: boolean,
  hasChildcareAllowance: boolean
): { mealAllowance: number; childcareAllowance: number; total: number } {
  const mealAllowance = hasMealAllowance ? KR_NON_TAXABLE_ALLOWANCES.mealAllowance.annualLimit : 0;
  const childcareAllowance = hasChildcareAllowance ? KR_NON_TAXABLE_ALLOWANCES.childcareAllowance.annualLimit : 0;

  return {
    mealAllowance,
    childcareAllowance,
    total: mealAllowance + childcareAllowance,
  };
}
