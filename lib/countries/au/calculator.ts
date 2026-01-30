// ============================================================================
// AUSTRALIA CALCULATOR IMPLEMENTATION
// Source: Australian Taxation Office (ATO)
// https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
// ============================================================================

import type {
  AUBreakdown,
  AUCalculatorInputs,
  AUTaxBreakdown,
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { AU_CONFIG } from "./config";
import {
  AU_NON_RESIDENT_TAX_BRACKETS_2026,
  AU_RESIDENT_TAX_BRACKETS_2026,
  calculateLITO,
  calculateMedicareLevy,
  calculateMedicareLevySurcharge,
  calculateSuperannuation,
} from "./constants/tax-brackets-2026";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

/**
 * Calculate progressive tax using tax brackets
 */
function calculateProgressiveTax(income: number, brackets: TaxBracket[]) {
  const bracketTaxes = brackets.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min,
    );
    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

// ============================================================================
// AUSTRALIA CALCULATOR
// ============================================================================
export function calculateAU(inputs: AUCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    hasPrivateHealthInsurance,
  } = inputs;

  const isResident = residencyType === "resident";

  // Step 1: Calculate taxable income (same as gross for basic calculation)
  const taxableIncome = grossSalary;

  // Step 2: Calculate income tax based on residency
  const taxBrackets = isResident
    ? AU_RESIDENT_TAX_BRACKETS_2026
    : AU_NON_RESIDENT_TAX_BRACKETS_2026;

  const { totalTax: grossIncomeTax, bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    taxBrackets,
  );

  // Step 3: Calculate LITO (residents only)
  const lito = isResident ? calculateLITO(taxableIncome) : 0;

  // Step 4: Final income tax after offsets
  const incomeTax = Math.max(0, grossIncomeTax - lito);

  // Step 5: Calculate Medicare levy (residents only)
  const medicareLevy = isResident ? calculateMedicareLevy(taxableIncome) : 0;

  // Step 6: Calculate Medicare levy surcharge (if no private health insurance)
  const medicareLevySurcharge = isResident
    ? calculateMedicareLevySurcharge(taxableIncome, hasPrivateHealthInsurance)
    : 0;

  // Step 7: Calculate superannuation (employer contribution - informational)
  const superannuation = calculateSuperannuation(grossSalary);

  // Step 8: Build tax breakdown
  const taxes: AUTaxBreakdown = {
    totalIncomeTax: incomeTax + medicareLevy + medicareLevySurcharge,
    incomeTax,
    medicareLevy,
    medicareLevySurcharge,
  };

  // Step 9: Calculate totals
  const totalTax = incomeTax + medicareLevy + medicareLevySurcharge;
  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Step 10: Build detailed breakdown
  const breakdown: AUBreakdown = {
    type: "AU",
    taxableIncome,
    bracketTaxes,
    grossIncomeTax,
    lito,
    incomeTax,
    medicareLevy,
    medicareLevySurcharge,
    hasPrivateHealthInsurance,
    superannuation: {
      employerContribution: superannuation,
      rate: 0.12,
    },
    isResident,
  };

  return {
    country: "AU",
    currency: "AUD",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

// ============================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ============================================================================
export const AUCalculator: CountryCalculator = {
  countryCode: "AU",
  config: AU_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "AU") {
      throw new Error("AUCalculator can only calculate AU inputs");
    }
    return calculateAU(inputs as AUCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return []; // Australia has no state income tax
  },

  getContributionLimits(): ContributionLimits {
    return {
      // Superannuation voluntary contribution limits could be added here
    };
  },

  getDefaultInputs(): AUCalculatorInputs {
    return {
      country: "AU",
      grossSalary: 100000,
      payFrequency: "monthly",
      residencyType: "resident",
      hasPrivateHealthInsurance: true, // Assume most have PHI
    };
  },
};
