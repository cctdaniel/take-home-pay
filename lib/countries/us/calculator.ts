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
} from "../types";
import { US_CONFIG } from "./config";
import {
  calculateFederalIncomeTax,
  calculateUSDependentCredits,
  getFederalTaxableIncome,
} from "./federal-tax";
import {
  PAYROLL_TAX_INFO,
  calculatePayrollTaxes,
} from "./payroll-tax";
import { getStateCalculator, getSupportedStates } from "./state-tax";
import { getUSContributionLimits } from "./constants/contribution-limits";

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

function clampContributionAmount(value: number, limit: number): number {
  return Math.min(Math.max(0, value), Math.max(0, limit));
}

// ============================================================================
// US CALCULATOR
// ============================================================================
export function calculateUS(inputs: USCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    state,
    filingStatus,
    payFrequency,
    contributions: rawContributions,
    numberOfQualifyingChildren,
    numberOfOtherDependents,
  } = inputs;

  const contributionLimits = getUSContributionLimits(
    rawContributions.hsaCoverageType,
    filingStatus,
  );
  const contributions = {
    ...rawContributions,
    traditional401k: clampContributionAmount(
      rawContributions.traditional401k,
      contributionLimits.traditional401k?.limit ?? 0,
    ),
    rothIRA: clampContributionAmount(
      rawContributions.rothIRA,
      contributionLimits.rothIRA?.limit ?? 0,
    ),
    hsa: clampContributionAmount(
      rawContributions.hsa,
      contributionLimits.hsa?.limit ?? 0,
    ),
    healthFsa: clampContributionAmount(
      rawContributions.healthFsa,
      contributionLimits.healthFsa?.limit ?? 0,
    ),
    dependentCareFsa: clampContributionAmount(
      rawContributions.dependentCareFsa,
      contributionLimits.dependentCareFsa?.limit ?? 0,
    ),
  };

  // Pre-tax deductions (reduce taxable income)
  const preTaxDeductions =
    contributions.traditional401k +
    contributions.hsa +
    contributions.healthFsa +
    contributions.dependentCareFsa;
  const section125Deductions =
    contributions.hsa +
    contributions.healthFsa +
    contributions.dependentCareFsa;
  const federalAdjustedGrossIncome = Math.max(
    0,
    grossSalary - preTaxDeductions,
  );

  // Calculate federal taxable income
  const taxableIncomeForFederal = getFederalTaxableIncome(grossSalary, filingStatus, preTaxDeductions);

  // Calculate state taxable income (state calculators apply their own deductions internally)
  const taxableIncomeForState = Math.max(0, grossSalary - preTaxDeductions);

  // Calculate federal taxes
  const federalIncomeTaxBeforeCredits = calculateFederalIncomeTax(
    grossSalary,
    filingStatus,
    preTaxDeductions,
  );
  const federalCredits = calculateUSDependentCredits({
    adjustedGrossIncome: federalAdjustedGrossIncome,
    filingStatus,
    numberOfQualifyingChildren,
    numberOfOtherDependents,
    federalTaxBeforeCredits: federalIncomeTaxBeforeCredits,
  });
  const federalIncomeTax = Math.max(
    0,
    federalIncomeTaxBeforeCredits - federalCredits.totalCreditsApplied,
  );

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

  // Payroll taxes. Traditional 401(k) reduces federal taxable income but remains
  // FICA wages; Section 125/HSA-style payroll deductions reduce FICA wages.
  const payrollTaxableWages = Math.max(0, grossSalary - section125Deductions);
  const payrollTaxes = calculatePayrollTaxes(payrollTaxableWages, filingStatus);

  const taxes: USTaxBreakdown = {
    totalIncomeTax: federalIncomeTax + stateIncomeTax,
    federalIncomeTaxBeforeCredits,
    federalTaxCredits: federalCredits.totalCreditsApplied,
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
    contributions.healthFsa +
    contributions.dependentCareFsa +
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
      healthFsa: contributions.healthFsa,
      dependentCareFsa: contributions.dependentCareFsa,
      total: totalContributions,
    },
    taxCredits: {
      ...federalCredits,
    },
    payrollTaxableWages: {
      socialSecurity: Math.min(
        payrollTaxableWages,
        PAYROLL_TAX_INFO.socialSecurityWageBase,
      ),
      medicare: payrollTaxableWages,
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
    const usInputs = inputs as Partial<USCalculatorInputs> | undefined;
    const hsaCoverageType = usInputs?.contributions?.hsaCoverageType ?? "self";
    const filingStatus = usInputs?.filingStatus ?? "single";
    return getUSContributionLimits(hsaCoverageType, filingStatus);
  },

  getDefaultInputs(): USCalculatorInputs {
    return {
      country: "US",
      grossSalary: 100000,
      state: "CA",
      filingStatus: "single",
      numberOfQualifyingChildren: 0,
      numberOfOtherDependents: 0,
      payFrequency: "monthly",
      contributions: {
        traditional401k: 0,
        rothIRA: 0,
        hsa: 0,
        healthFsa: 0,
        dependentCareFsa: 0,
        hsaCoverageType: "self",
      },
    };
  },
};
