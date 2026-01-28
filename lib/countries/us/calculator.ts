// ============================================================================
// US CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CountryCalculator,
  CalculatorInputs,
  CalculationResult,
  USCalculatorInputs,
  USTaxBreakdown,
  USBreakdown,
  RegionInfo,
  ContributionLimits,
  PayFrequency,
  USFilingStatus,
  isUSInputs,
} from "../types";
import { US_CONFIG } from "./config";
import { calculateFederalIncomeTax, getFederalTaxableIncome, getStandardDeduction } from "./federal-tax";
import { calculatePayrollTaxes } from "./payroll-tax";
import { getStateCalculator, hasNoIncomeTax, getSupportedStates } from "./state-tax";
import { getUSContributionLimits, CONTRIBUTION_LIMITS, type HSACoverageType } from "./constants/contribution-limits";

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

function getStateStandardDeduction(
  stateCode: string,
  filingStatus: USFilingStatus
): number {
  if (hasNoIncomeTax(stateCode)) {
    return 0;
  }

  // Note: NC and AZ are NOT included here because their deductions are already
  // handled by createFlatTaxCalculator via FLAT_TAX_STATE_DEDUCTIONS
  const stateDeductions: Record<string, Record<USFilingStatus, number>> = {
    CA: { single: 5540, married_jointly: 11080, married_separately: 5540, head_of_household: 11080 },
    NY: { single: 8000, married_jointly: 16050, married_separately: 8000, head_of_household: 11200 },
    GA: { single: 12000, married_jointly: 24000, married_separately: 12000, head_of_household: 18000 },
  };

  return stateDeductions[stateCode]?.[filingStatus] ?? 0;
}

// ============================================================================
// US CALCULATOR
// ============================================================================
export function calculateUS(inputs: USCalculatorInputs): CalculationResult {
  const { grossSalary, state, filingStatus, payFrequency, contributions } = inputs;

  // Pre-tax deductions (reduce taxable income)
  const preTaxDeductions = contributions.traditional401k + contributions.hsa;

  // Calculate federal taxable income
  const taxableIncomeForFederal = getFederalTaxableIncome(grossSalary, filingStatus, preTaxDeductions);

  // Calculate state taxable income
  const stateDeduction = getStateStandardDeduction(state, filingStatus);
  const taxableIncomeForState = Math.max(0, grossSalary - preTaxDeductions - stateDeduction);

  // Calculate federal taxes
  const federalIncomeTax = calculateFederalIncomeTax(grossSalary, filingStatus, preTaxDeductions);

  // Calculate state taxes
  const stateCalculator = getStateCalculator(state);
  let stateIncomeTax = 0;
  let stateDisabilityInsurance = 0;
  let stateName = state;

  if (stateCalculator) {
    stateIncomeTax = stateCalculator.calculateStateTax(taxableIncomeForState, filingStatus);
    stateDisabilityInsurance = stateCalculator.calculateSDI(grossSalary);
    stateName = stateCalculator.getStateName();
  }

  // Payroll taxes (on gross income)
  const payrollTaxes = calculatePayrollTaxes(grossSalary, filingStatus);

  const taxes: USTaxBreakdown = {
    totalIncomeTax: federalIncomeTax + stateIncomeTax,
    federalIncomeTax,
    stateIncomeTax,
    socialSecurity: payrollTaxes.socialSecurity,
    medicare: payrollTaxes.medicare,
    additionalMedicare: payrollTaxes.additionalMedicare,
    stateDisabilityInsurance,
  };

  const totalTax =
    taxes.federalIncomeTax +
    taxes.stateIncomeTax +
    taxes.socialSecurity +
    taxes.medicare +
    taxes.additionalMedicare +
    taxes.stateDisabilityInsurance;

  const totalContributions =
    contributions.traditional401k +
    contributions.hsa +
    contributions.rothIRA;

  const netSalary = grossSalary - totalTax - totalContributions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: USBreakdown = {
    type: "US",
    taxableIncomeForFederal,
    taxableIncomeForState,
    stateName,
    contributions: {
      traditional401k: contributions.traditional401k,
      rothIRA: contributions.rothIRA,
      hsa: contributions.hsa,
    },
  };

  return {
    country: "US",
    currency: "USD",
    grossSalary,
    taxableIncome: taxableIncomeForFederal,
    taxes,
    totalTax,
    totalDeductions: totalTax + totalContributions,
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
export const USCalculator: CountryCalculator = {
  countryCode: "US",
  config: US_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "US") {
      throw new Error("USCalculator can only calculate US inputs");
    }
    return calculateUS(inputs as USCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return getSupportedStates();
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const hsaCoverageType = (inputs as Partial<USCalculatorInputs>)?.contributions?.hsaCoverageType ?? "self";
    return getUSContributionLimits(hsaCoverageType);
  },

  getDefaultInputs(): USCalculatorInputs {
    return {
      country: "US",
      grossSalary: 100000,
      state: "CA",
      filingStatus: "single",
      payFrequency: "monthly",
      contributions: {
        traditional401k: 0,
        rothIRA: 0,
        hsa: 0,
        hsaCoverageType: "self",
      },
    };
  },
};
