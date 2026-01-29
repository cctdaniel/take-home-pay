// ============================================================================
// NETHERLANDS CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  NLBreakdown,
  NLCalculatorInputs,
  NLTaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { NL_CONFIG } from "./config";
import {
  NETHERLANDS_TAX_BRACKETS_2026,
  NL_INCOME_TAX_RATES_2026,
  NL_SOCIAL_SECURITY_RATES_2026,
} from "./constants/tax-brackets-2026";
import {
  calculateGeneralTaxCredit,
  calculateIACK,
  calculateLaborTaxCredit,
} from "./constants/tax-credits-2026";

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
 * Calculate combined progressive tax (for backwards compat / UI bracket display)
 */
function calculateProgressiveTax(income: number) {
  const bracketTaxes = NETHERLANDS_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min,
    );
    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

/**
 * Calculate social security (volksverzekeringen) separately
 * Social security is capped at the first bracket threshold (€38,883)
 */
function calculateSocialSecurity(taxableIncome: number) {
  const { aow, anw, wlz, ceiling } = NL_SOCIAL_SECURITY_RATES_2026;

  // Social security only applies up to the ceiling
  const taxableForSocialSecurity = Math.min(taxableIncome, ceiling);

  const aowTax = taxableForSocialSecurity * aow;
  const anwTax = taxableForSocialSecurity * anw;
  const wlzTax = taxableForSocialSecurity * wlz;
  const total = aowTax + anwTax + wlzTax;

  return {
    aow: aowTax,
    anw: anwTax,
    wlz: wlzTax,
    total,
    ceiling,
    taxableForSocialSecurity,
  };
}

/**
 * Calculate pure income tax (inkomstenbelasting) separately
 * Bracket 1: 8.10% (combined 35.75% minus 27.65% social security)
 * Bracket 2: 37.56% (pure income tax, no social security)
 * Bracket 3: 49.50% (pure income tax, no social security)
 */
function calculateIncomeTax(taxableIncome: number) {
  const { bracket1Rate, bracket2Rate, bracket3Rate } = NL_INCOME_TAX_RATES_2026;
  const bracket1Limit = 38883;
  const bracket2Limit = 78426;

  // Bracket 1: up to €38,883
  const bracket1Taxable = Math.min(taxableIncome, bracket1Limit);
  const bracket1Tax = bracket1Taxable * bracket1Rate;

  // Bracket 2: €38,883 to €78,426
  const bracket2Taxable = Math.max(
    0,
    Math.min(taxableIncome, bracket2Limit) - bracket1Limit,
  );
  const bracket2Tax = bracket2Taxable * bracket2Rate;

  // Bracket 3: above €78,426
  const bracket3Taxable = Math.max(0, taxableIncome - bracket2Limit);
  const bracket3Tax = bracket3Taxable * bracket3Rate;

  const total = bracket1Tax + bracket2Tax + bracket3Tax;

  return {
    bracket1Tax,
    bracket2Tax,
    bracket3Tax,
    total,
  };
}

// ============================================================================
// NETHERLANDS CALCULATOR
// ============================================================================
export function calculateNL(inputs: NLCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    hasThirtyPercentRuling,
    hasYoungChildren,
  } = inputs;

  // Apply 30% ruling if applicable (reduces taxable base)
  const taxExemptAllowance = hasThirtyPercentRuling ? grossSalary * 0.3 : 0;
  const taxableIncome = grossSalary - taxExemptAllowance;

  // Calculate combined progressive tax (for backwards compat / bracket display)
  const { totalTax: combinedTaxBeforeCredits, bracketTaxes } =
    calculateProgressiveTax(taxableIncome);

  // Calculate SEPARATE income tax and social security
  const socialSecurity = calculateSocialSecurity(taxableIncome);
  const incomeTaxBreakdown = calculateIncomeTax(taxableIncome);

  // Tax before credits = income tax + social security
  const taxBeforeCredits = incomeTaxBreakdown.total + socialSecurity.total;

  // Calculate tax credits (based on taxable income)
  // Credits apply to the combined tax, proportionally split between income tax and social security
  const generalTaxCredit = calculateGeneralTaxCredit(taxableIncome);
  const laborTaxCredit = calculateLaborTaxCredit(taxableIncome);
  const iackCredit = calculateIACK(taxableIncome, hasYoungChildren);
  const totalCredits = generalTaxCredit + laborTaxCredit + iackCredit;

  // Final combined tax cannot be negative
  const totalTax = Math.max(0, taxBeforeCredits - totalCredits);

  // Credits reduce tax proportionally - calculate final income tax and social security
  // The Dutch system applies credits to combined tax, so we prorate the reduction
  const creditRatio =
    taxBeforeCredits > 0 ? Math.min(1, totalCredits / taxBeforeCredits) : 0;
  const finalIncomeTax = Math.max(
    0,
    incomeTaxBreakdown.total * (1 - creditRatio),
  );
  const finalSocialSecurityTax = Math.max(
    0,
    socialSecurity.total * (1 - creditRatio),
  );

  const taxes: NLTaxBreakdown = {
    totalIncomeTax: totalTax,
    incomeTax: finalIncomeTax,
    socialSecurityTax: finalSocialSecurityTax,
  };

  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: NLBreakdown = {
    type: "NL",
    bracketTaxes,
    socialSecurity,
    incomeTaxBreakdown,
    taxCredits: {
      generalTaxCredit,
      laborTaxCredit,
      iackCredit,
      totalCredits,
    },
    taxBeforeCredits: combinedTaxBeforeCredits, // Use combined for UI display
    taxableIncome,
    thirtyPercentRulingApplied: hasThirtyPercentRuling,
    taxExemptAllowance,
  };

  return {
    country: "NL",
    currency: "EUR",
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
export const NLCalculator: CountryCalculator = {
  countryCode: "NL",
  config: NL_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NL") {
      throw new Error("NLCalculator can only calculate NL inputs");
    }
    return calculateNL(inputs as NLCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): NLCalculatorInputs {
    return {
      country: "NL",
      grossSalary: 55000,
      payFrequency: "monthly",
      hasThirtyPercentRuling: false,
      hasYoungChildren: false,
    };
  },
};
