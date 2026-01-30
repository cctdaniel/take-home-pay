// ============================================================================
// AUSTRALIA TAX BRACKETS (2025-26)
// Source: Australian Taxation Office (ATO)
// https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
// https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// RESIDENT TAX BRACKETS 2025-26
// Stage 3 tax cuts in effect since 2024-25
// ============================================================================
export const AU_RESIDENT_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 18200,
    rate: 0, // Tax-free threshold
  },
  {
    min: 18200,
    max: 45000,
    rate: 0.16, // 16%
  },
  {
    min: 45000,
    max: 135000,
    rate: 0.30, // 30%
  },
  {
    min: 135000,
    max: 190000,
    rate: 0.37, // 37%
  },
  {
    min: 190000,
    max: Infinity,
    rate: 0.45, // 45%
  },
];

// ============================================================================
// NON-RESIDENT (FOREIGN RESIDENT) TAX BRACKETS 2025-26
// No tax-free threshold, taxed from first dollar
// ============================================================================
export const AU_NON_RESIDENT_TAX_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 135000,
    rate: 0.325, // 32.5%
  },
  {
    min: 135000,
    max: 190000,
    rate: 0.37, // 37%
  },
  {
    min: 190000,
    max: Infinity,
    rate: 0.45, // 45%
  },
];

// ============================================================================
// MEDICARE LEVY 2025-26
// Source: https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy
// ============================================================================
export const AU_MEDICARE_LEVY_2026 = {
  rate: 0.02, // 2% of taxable income
  // Low-income reduction thresholds for singles
  lowIncomeThresholds: {
    lowerThreshold: 27222, // No Medicare levy below this
    upperThreshold: 34027, // Full levy above this
    // Reduction rate: 10% of excess above lower threshold
    reductionRate: 0.10,
  },
};

// ============================================================================
// MEDICARE LEVY SURCHARGE 2025-26
// Applies if no private hospital insurance and income above thresholds
// Source: https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy-surcharge
// ============================================================================
export const AU_MEDICARE_LEVY_SURCHARGE_2026 = {
  // Single thresholds (2025-26)
  singleThresholds: {
    base: 101000, // No surcharge below this
    tier1: 117999,
    tier2: 157999,
  },
  // Family thresholds
  familyThresholds: {
    base: 202000,
    tier1: 235999,
    tier2: 315999,
    perChildIncrease: 1500, // Increase per dependent child after first
  },
  // Surcharge rates
  rates: {
    tier1: 0.01, // 1.0%
    tier2: 0.0125, // 1.25%
    tier3: 0.015, // 1.5%
  },
};

// ============================================================================
// LOW INCOME TAX OFFSET (LITO) 2025-26
// Source: https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset
// ============================================================================
export const AU_LITO_2026 = {
  maxOffset: 700, // Maximum offset amount
  fullOffsetThreshold: 37500, // Full offset up to this income
  firstTaperThreshold: 45000, // First taper ends here
  secondTaperThreshold: 66667, // LITO phases out completely here
  firstTaperRate: 0.05, // 5 cents per dollar
  secondTaperRate: 0.015, // 1.5 cents per dollar
};

// ============================================================================
// SUPERANNUATION GUARANTEE 2025-26
// Source: https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
// Note: Employer pays this ON TOP of salary, not deducted from employee
// ============================================================================
export const AU_SUPERANNUATION_2026 = {
  rate: 0.12, // 12% from July 2025
  maxContributionBase: 62500, // Per quarter ($250,000 per year)
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Low Income Tax Offset (LITO)
 * Only applies to Australian residents
 */
export function calculateLITO(taxableIncome: number): number {
  const { maxOffset, fullOffsetThreshold, firstTaperThreshold, secondTaperThreshold, firstTaperRate, secondTaperRate } = AU_LITO_2026;

  if (taxableIncome <= fullOffsetThreshold) {
    return maxOffset;
  }

  if (taxableIncome <= firstTaperThreshold) {
    // Reduce by 5 cents per dollar above $37,500
    const reduction = (taxableIncome - fullOffsetThreshold) * firstTaperRate;
    return Math.max(0, maxOffset - reduction);
  }

  if (taxableIncome <= secondTaperThreshold) {
    // First taper: $700 - ($45,000 - $37,500) * 0.05 = $700 - $375 = $325
    const afterFirstTaper = maxOffset - (firstTaperThreshold - fullOffsetThreshold) * firstTaperRate; // $325
    // Then reduce by 1.5 cents per dollar above $45,000
    const reduction = (taxableIncome - firstTaperThreshold) * secondTaperRate;
    return Math.max(0, afterFirstTaper - reduction);
  }

  // Income above $66,667 - no LITO
  return 0;
}

/**
 * Calculate Medicare Levy for residents
 * Non-residents don't pay Medicare levy
 */
export function calculateMedicareLevy(taxableIncome: number): number {
  const { rate, lowIncomeThresholds } = AU_MEDICARE_LEVY_2026;
  const { lowerThreshold, upperThreshold, reductionRate } = lowIncomeThresholds;

  if (taxableIncome <= lowerThreshold) {
    return 0;
  }

  if (taxableIncome <= upperThreshold) {
    // Shade-in: 10% of excess above lower threshold
    return (taxableIncome - lowerThreshold) * reductionRate;
  }

  // Full levy: 2% of taxable income
  return taxableIncome * rate;
}

/**
 * Calculate Medicare Levy Surcharge
 * Only applies to high income earners without private hospital insurance
 */
export function calculateMedicareLevySurcharge(
  taxableIncome: number,
  hasPrivateHealthInsurance: boolean,
): number {
  if (hasPrivateHealthInsurance) {
    return 0;
  }

  const { singleThresholds, rates } = AU_MEDICARE_LEVY_SURCHARGE_2026;

  if (taxableIncome <= singleThresholds.base) {
    return 0;
  }

  if (taxableIncome <= singleThresholds.tier1) {
    return taxableIncome * rates.tier1;
  }

  if (taxableIncome <= singleThresholds.tier2) {
    return taxableIncome * rates.tier2;
  }

  return taxableIncome * rates.tier3;
}

/**
 * Calculate superannuation (employer contribution)
 * This is informational - not deducted from employee salary
 */
export function calculateSuperannuation(grossSalary: number): number {
  const { rate, maxContributionBase } = AU_SUPERANNUATION_2026;
  // Cap at maximum contribution base ($250,000/year)
  const maxAnnualBase = maxContributionBase * 4;
  const contributableIncome = Math.min(grossSalary, maxAnnualBase);
  return contributableIncome * rate;
}
