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
} from "../types";
import { US_CONFIG } from "./config";
import { calculateFederalIncomeTax, getFederalTaxableIncome } from "./federal-tax";
import { calculatePayrollTaxes } from "./payroll-tax";
import { getStateCalculator, getSupportedStates } from "./state-tax";
import {
  getUSContributionLimits,
  getElectiveDeferralLimit,
} from "./contribution-limits";
import type { HSACoverageType } from "./contribution-limits";
import { calculateUSFamilyTaxCredits } from "./tax-credits";
import { getPeriodsPerYear } from "../calculator-utils";


function sumPreTaxDeductions(contributions: USCalculatorInputs["contributions"]): number {
  return (
    contributions.traditional401k +
    contributions.traditionalIRA +
    contributions.hsa +
    contributions.fsa +
    contributions.dependentCareFSA +
    contributions.commuterBenefits +
    contributions.studentLoanInterest
  );
}

export function calculateUS(inputs: USCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    state,
    filingStatus,
    payFrequency,
    contributions,
    age,
    numberOfQualifyingChildren,
    numberOfOtherDependents,
  } = inputs;

  const deferralCap = getElectiveDeferralLimit(age);
  const traditional401k = Math.min(contributions.traditional401k, deferralCap);
  const roth401k = Math.min(
    contributions.roth401k,
    Math.max(0, deferralCap - traditional401k),
  );

  const clampedContributions: USCalculatorInputs["contributions"] = {
    ...contributions,
    traditional401k,
    roth401k,
  };

  const preTaxDeductions = sumPreTaxDeductions(clampedContributions);

  const modifiedAGI = Math.max(0, grossSalary - preTaxDeductions);
  const taxableIncomeForFederal = getFederalTaxableIncome(
    grossSalary,
    filingStatus,
    preTaxDeductions,
  );
  const taxableIncomeForState = Math.max(0, grossSalary - preTaxDeductions);

  let federalIncomeTax = calculateFederalIncomeTax(
    grossSalary,
    filingStatus,
    preTaxDeductions,
  );

  const familyCredits = calculateUSFamilyTaxCredits({
    filingStatus,
    modifiedAGI,
    numberOfQualifyingChildren,
    numberOfOtherDependents,
  });
  federalIncomeTax = Math.max(0, federalIncomeTax - familyCredits.totalCredits);

  const stateCalculator = getStateCalculator(state);
  let stateIncomeTax = 0;
  let stateDisabilityInsurance = 0;
  let stateName = state;

  if (stateCalculator) {
    stateIncomeTax = stateCalculator.calculateStateTax(
      taxableIncomeForState,
      filingStatus,
    );
    stateDisabilityInsurance = stateCalculator.calculateSDI(grossSalary);
    stateName = stateCalculator.getStateName();
  }

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

  const postTaxContributions =
    clampedContributions.rothIRA + clampedContributions.roth401k;

  const netSalary = grossSalary - totalTax - postTaxContributions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: USBreakdown = {
    type: "US",
    taxableIncomeForFederal,
    taxableIncomeForState,
    modifiedAGI,
    stateName,
    preTaxDeductions,
    taxCredits: {
      childTaxCredit: familyCredits.childTaxCredit,
      otherDependentCredit: familyCredits.otherDependentCredit,
      totalCredits: familyCredits.totalCredits,
      phaseOutReduction: familyCredits.phaseOutReduction,
    },
    contributions: clampedContributions,
  };

  return {
    country: "US",
    currency: "USD",
    grossSalary,
    taxableIncome: taxableIncomeForFederal,
    taxes,
    totalTax,
    totalDeductions: totalTax + postTaxContributions + preTaxDeductions,
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
    const us = inputs as Partial<USCalculatorInputs> | undefined;
    const age = us?.age ?? 30;
    const hsaCoverageType =
      (us?.contributions?.hsaCoverageType as HSACoverageType | undefined) ?? "self";
    const filingStatus = us?.filingStatus ?? "single";
    return getUSContributionLimits(age, hsaCoverageType, filingStatus);
  },

  getDefaultInputs(): USCalculatorInputs {
    return {
      country: "US",
      grossSalary: 100_000,
      state: "CA",
      filingStatus: "single",
      payFrequency: "monthly",
      age: 30,
      numberOfQualifyingChildren: 0,
      numberOfOtherDependents: 0,
      contributions: {
        traditional401k: 0,
        roth401k: 0,
        rothIRA: 0,
        traditionalIRA: 0,
        hsa: 0,
        hsaCoverageType: "self",
        fsa: 0,
        dependentCareFSA: 0,
        commuterBenefits: 0,
        studentLoanInterest: 0,
      },
    };
  },
};
