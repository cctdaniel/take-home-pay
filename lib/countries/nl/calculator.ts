// ============================================================================
// NETHERLANDS CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CountryCalculator,
  CalculatorInputs,
  CalculationResult,
  NLCalculatorInputs,
  NLTaxBreakdown,
  NLBreakdown,
  RegionInfo,
  ContributionLimits,
  PayFrequency,
} from "../types";
import { NL_CONFIG } from "./config";
import { NETHERLANDS_TAX_BRACKETS_2026 } from "./constants/tax-brackets-2026";
import { calculateGeneralTaxCredit, calculateLaborTaxCredit } from "./constants/tax-credits-2026";

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

function calculateProgressiveTax(income: number) {
  const bracketTaxes = NETHERLANDS_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(0, Math.min(income, bracket.max) - bracket.min);
    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter(bracket => bracket.tax > 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

// ============================================================================
// NETHERLANDS CALCULATOR
// ============================================================================
export function calculateNL(inputs: NLCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, hasThirtyPercentRuling } = inputs;

  const taxExemptAllowance = hasThirtyPercentRuling ? grossSalary * 0.3 : 0;
  const taxableIncome = grossSalary - taxExemptAllowance;

  const { totalTax: taxBeforeCredits, bracketTaxes } = calculateProgressiveTax(taxableIncome);
  const generalTaxCredit = calculateGeneralTaxCredit(taxableIncome);
  const laborTaxCredit = calculateLaborTaxCredit(taxableIncome);
  const totalCredits = generalTaxCredit + laborTaxCredit;
  const totalTax = Math.max(0, taxBeforeCredits - totalCredits);

  const taxes: NLTaxBreakdown = {
    totalIncomeTax: totalTax,
    incomeTax: totalTax,
  };

  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: NLBreakdown = {
    type: "NL",
    bracketTaxes,
    taxCredits: {
      generalTaxCredit,
      laborTaxCredit,
      totalCredits,
    },
    taxBeforeCredits,
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
    };
  },
};
