import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type CYResidencyType = "resident" | "non_resident";

export type CYFamilyStatus = "single" | "married" | "single_parent";

export interface CYContributionInputs {
  approvedPensionProvidentFund: number;
  homeInsurancePremium: number;
  primaryResidenceDeduction: number;
  greenTransitionExpense: number;
}

export interface CYTaxReliefInputs {
  familyStatus: CYFamilyStatus;
  numberOfDependentChildren: number;
  meetsFamilyIncomeCriteria: boolean;
}

export interface CYCalculatorInputs extends BaseCalculatorInputs {
  country: "CY";
  residencyType: CYResidencyType;
  contributions: CYContributionInputs;
  taxReliefs: CYTaxReliefInputs;
}

export interface CYTaxBreakdown extends BaseTaxBreakdown {
  type: "CY";
  incomeTax: number;
  socialSecurity: number;
  socialInsurance: number;
  gesy: number;
}

export interface CYBreakdown {
  type: "CY";
  grossIncome: number;
  residencyType: CYResidencyType;
  isResident: boolean;
  taxableIncome: number;
  chargeableIncome: number;
  familyStatus: CYFamilyStatus;
  numberOfDependentChildren: number;
  meetsFamilyIncomeCriteria: boolean;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  incomeTax: number;
  socialInsurance: {
    employee: number;
    employer: number;
    state: number;
    employeeRate: number;
    employerRate: number;
    stateRate: number;
    insurableIncome: number;
    monthlyCeiling: number;
    weeklyCeiling: number;
    annualCeiling: number;
  };
  gesy: {
    employee: number;
    employer: number;
    employeeRate: number;
    employerRate: number;
    insurableIncome: number;
    annualIncomeCeiling: number;
  };
  deductions: {
    homeInsurance: number;
    contributionGroupCap: number;
    mandatoryContributionDeduction: number;
    approvedPensionProvidentFundDeduction: number;
    contributionGroupDeduction: number;
    disallowedContributionDeduction: number;
    childDeduction: number;
    primaryResidence: number;
    greenTransition: number;
    totalTaxDeductions: number;
  };
  voluntaryContributions: {
    approvedPensionProvidentFund: number;
    pensionProvidentModeledLimit: number;
    total: number;
  };
  assumptions: {
    appliesFirstEmploymentExemption: boolean;
    includesLifeInsurancePremiums: boolean;
    includesMedicalFundContributions: boolean;
    includesSpecialDefenceContribution: boolean;
  };
}

declare module "../types" {
  interface CountryCodeMap {
    CY: true;
  }

  interface ContributionInputMap {
    CY: CYContributionInputs;
  }

  interface CalculatorInputMap {
    CY: CYCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CY: CYTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CY: CYBreakdown;
  }
}

export function isCYInputs(
  inputs: CalculatorInputs,
): inputs is CYCalculatorInputs {
  return inputs.country === "CY";
}

export function isCYTaxBreakdown(taxes: TaxBreakdown): taxes is CYTaxBreakdown {
  return "type" in taxes && taxes.type === "CY";
}

export function isCYBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CYBreakdown {
  return breakdown.type === "CY";
}
