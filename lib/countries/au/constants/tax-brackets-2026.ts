// ============================================================================
// AUSTRALIA TAX BRACKETS (2025-26)
// Source: Australian Taxation Office (ATO)
// https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
// https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
// ============================================================================

import type { TaxBracket } from "../../types";

export const AU_SOURCE_URLS = [
  "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents",
  "https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents",
  "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy",
  "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy-surcharge",
  "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-family-income",
  "https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy-surcharge/family-and-dependants-for-medicare-levy-surcharge-purposes",
  "https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/contributions-caps",
  "https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee",
  "https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/division-293-tax",
  "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim",
  "https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/deductions-you-can-claim/gifts-and-donations",
] as const;

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
  // ATO low-income reduction thresholds published for 2024-25 and used as
  // the latest available Medicare levy reduction thresholds for this 2025-26
  // salary projection until ATO publishes the 2026 return instructions.
  lowIncomeThresholds: {
    lowerThreshold: 27222, // No Medicare levy below this
    upperThreshold: 34027, // Full levy above this
    // Reduction rate: 10% of excess above lower threshold
    reductionRate: 0.10,
  },
  familyIncomeThresholds: {
    lowerThreshold: 45_907,
    dependentChildIncrease: 4_216,
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

export const AU_CONCESSIONAL_SUPER_CAP_2026 = 30000;

// ============================================================================
// DIVISION 293 TAX 2025-26
// Source: https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/caps-limits-and-tax-on-super-contributions/division-293-tax-on-concessional-contributions-by-high-income-earners
// Additional 15% tax on concessional super contributions for high income earners
// ============================================================================
export const AU_DIVISION_293_2026 = {
  threshold: 250000, // Income + super contributions threshold
  rate: 0.15, // 15% additional tax
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
export function getMedicareLevyThresholds({
  familyStatus = "single",
  numberOfDependentChildren = 0,
}: {
  familyStatus?: "single" | "family";
  numberOfDependentChildren?: number;
} = {}) {
  const { rate, lowIncomeThresholds, familyIncomeThresholds } =
    AU_MEDICARE_LEVY_2026;

  if (familyStatus === "family") {
    const lowerThreshold =
      familyIncomeThresholds.lowerThreshold +
      Math.max(0, Math.floor(numberOfDependentChildren)) *
        familyIncomeThresholds.dependentChildIncrease;

    return {
      lowerThreshold,
      upperThreshold: lowerThreshold / (1 - rate / familyIncomeThresholds.reductionRate),
      reductionRate: familyIncomeThresholds.reductionRate,
    };
  }

  return lowIncomeThresholds;
}

/**
 * Calculate Medicare Levy for residents.
 * Non-residents do not pay Medicare levy; callers gate this function.
 */
export function calculateMedicareLevy(
  taxableIncome: number,
  options: {
    familyStatus?: "single" | "family";
    spouseTaxableIncome?: number;
    numberOfDependentChildren?: number;
  } = {},
): number {
  const { rate } = AU_MEDICARE_LEVY_2026;
  const { familyStatus = "single", spouseTaxableIncome = 0 } = options;
  const lowIncomeThresholds = getMedicareLevyThresholds(options);
  const { lowerThreshold, upperThreshold, reductionRate } = lowIncomeThresholds;
  const familyIncome =
    familyStatus === "family"
      ? Math.max(0, taxableIncome) + Math.max(0, spouseTaxableIncome)
      : Math.max(0, taxableIncome);
  const fullLevy = Math.max(0, taxableIncome) * rate;

  if (familyIncome <= lowerThreshold) {
    return 0;
  }

  if (familyIncome <= upperThreshold) {
    const familyReducedLevy = (familyIncome - lowerThreshold) * reductionRate;
    const taxpayerShare =
      familyStatus === "family" && familyIncome > 0
        ? Math.max(0, taxableIncome) / familyIncome
        : 1;

    return Math.min(fullLevy, familyReducedLevy * taxpayerShare);
  }

  // Full levy: 2% of taxable income
  return fullLevy;
}

export function getMedicareLevySurchargeThresholds({
  familyStatus = "single",
  numberOfDependentChildren = 0,
}: {
  familyStatus?: "single" | "family";
  numberOfDependentChildren?: number;
} = {}) {
  const { singleThresholds, familyThresholds } =
    AU_MEDICARE_LEVY_SURCHARGE_2026;

  if (familyStatus === "family") {
    const childIncrease =
      Math.max(0, Math.floor(numberOfDependentChildren) - 1) *
      familyThresholds.perChildIncrease;

    return {
      base: familyThresholds.base + childIncrease,
      tier1: familyThresholds.tier1 + childIncrease,
      tier2: familyThresholds.tier2 + childIncrease,
    };
  }

  return singleThresholds;
}

/**
 * Calculate Medicare Levy Surcharge
 * Only applies to high income earners without private hospital insurance
 */
export function calculateMedicareLevySurcharge(
  mlsIncome: number,
  hasPrivateHealthInsurance: boolean,
  options: {
    familyStatus?: "single" | "family";
    spouseIncomeForSurcharge?: number;
    numberOfDependentChildren?: number;
  } = {},
): number {
  if (hasPrivateHealthInsurance) {
    return 0;
  }

  const { rates } = AU_MEDICARE_LEVY_SURCHARGE_2026;
  const {
    familyStatus = "single",
    spouseIncomeForSurcharge = 0,
  } = options;
  const thresholds = getMedicareLevySurchargeThresholds(options);
  const thresholdIncome =
    familyStatus === "family"
      ? Math.max(0, mlsIncome) + Math.max(0, spouseIncomeForSurcharge)
      : Math.max(0, mlsIncome);

  if (thresholdIncome <= thresholds.base) {
    return 0;
  }

  if (thresholdIncome <= thresholds.tier1) {
    return Math.max(0, mlsIncome) * rates.tier1;
  }

  if (thresholdIncome <= thresholds.tier2) {
    return Math.max(0, mlsIncome) * rates.tier2;
  }

  return Math.max(0, mlsIncome) * rates.tier3;
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

/**
 * Calculate Division 293 tax on concessional super contributions
 * Applies when income + concessional contributions exceed $250,000
 * Tax is 15% of the lesser of:
 *   - The concessional super contributions, OR
 *   - The amount exceeding the $250,000 threshold
 * 
 * Note: This is a personal tax liability, not deducted from salary,
 * but it affects the employee's overall tax position
 */
export function calculateDivision293Tax(
  taxableIncome: number,
  concessionalSuperContributions: number,
): {
  division293Tax: number;
  division293Income: number;
  taxableContributions: number;
} {
  const { threshold, rate } = AU_DIVISION_293_2026;

  // Division 293 income is similar to Medicare Levy Surcharge income
  // For simplicity, we use taxable income (ATO uses a more complex calculation)
  const division293Income = taxableIncome;
  const total = division293Income + concessionalSuperContributions;

  // Check if over threshold
  if (total <= threshold) {
    return {
      division293Tax: 0,
      division293Income,
      taxableContributions: 0,
    };
  }

  // Taxable contributions is the lesser of:
  // - The concessional super contributions, OR
  // - The amount exceeding the threshold
  const excessOverThreshold = total - threshold;
  const taxableContributions = Math.min(concessionalSuperContributions, excessOverThreshold);
  const division293Tax = taxableContributions * rate;

  return {
    division293Tax,
    division293Income,
    taxableContributions,
  };
}
