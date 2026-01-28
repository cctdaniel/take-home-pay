// ============================================================================
// MAIN CALCULATOR
// This file provides backwards compatibility while using the new country system
// ============================================================================

import type { CalculatorInputs, CalculationResult, PayFrequency } from "./types";
import type { FilingStatus } from "../constants/tax-brackets-2025";
import { calculateUS } from "../countries/us";
import type { USCalculatorInputs, USContributionInputs } from "../countries/types";

// Re-export the new multi-country calculator
export { calculateNetSalary as calculateNetSalaryMultiCountry } from "../countries/registry";

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
 * Calculate net salary - backwards compatible wrapper
 * This function maintains the original API while using the new country-based system
 */
export function calculateNetSalary(inputs: CalculatorInputs): CalculationResult {
  // Convert legacy inputs to US-specific inputs
  const usInputs: USCalculatorInputs = {
    country: "US",
    grossSalary: inputs.grossSalary,
    state: inputs.state,
    filingStatus: inputs.filingStatus,
    payFrequency: inputs.payFrequency,
    contributions: {
      traditional401k: inputs.contributions.traditional401k,
      rothIRA: inputs.contributions.rothIRA,
      hsa: inputs.contributions.hsa,
      hsaCoverageType: inputs.contributions.hsaCoverageType,
    },
  };

  // Use the new US calculator
  const result = calculateUS(usInputs);

  // Convert back to legacy format for backwards compatibility
  const usBreakdown = result.breakdown;
  if (usBreakdown.type !== "US") {
    throw new Error("Expected US breakdown");
  }

  const usTaxes = result.taxes;
  if (!("federalIncomeTax" in usTaxes)) {
    throw new Error("Expected US taxes");
  }

  return {
    grossSalary: result.grossSalary,
    taxableIncomeForFederal: usBreakdown.taxableIncomeForFederal,
    taxableIncomeForState: usBreakdown.taxableIncomeForState,
    taxes: {
      federalIncomeTax: usTaxes.federalIncomeTax,
      stateIncomeTax: usTaxes.stateIncomeTax,
      socialSecurity: usTaxes.socialSecurity,
      medicare: usTaxes.medicare,
      additionalMedicare: usTaxes.additionalMedicare,
      stateDisabilityInsurance: usTaxes.stateDisabilityInsurance,
    },
    totalTax: result.totalTax,
    totalContributions:
      inputs.contributions.traditional401k +
      inputs.contributions.rothIRA +
      inputs.contributions.hsa,
    netSalary: result.netSalary,
    effectiveTaxRate: result.effectiveTaxRate,
    perPeriod: result.perPeriod,
  };
}
