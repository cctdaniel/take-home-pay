import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type GRResidencyType = "resident" | "non_resident";

export type GRTaxRegime = "ordinary" | "article_5c_new_resident";

export interface GRContributionInputs {
  occupationalPensionContribution: number;
}

export interface GRCalculatorInputs extends BaseCalculatorInputs {
  country: "GR";
  taxableBenefitsInKind: number;
  taxRegime: GRTaxRegime;
  residencyType: GRResidencyType;
  age: number;
  numberOfDependents: number;
  contributions: GRContributionInputs;
}

export interface GRTaxBreakdown extends BaseTaxBreakdown {
  type: "GR";
  incomeTax: number;
  socialInsurance: number;
}

export interface GRBreakdown {
  type: "GR";
  grossIncome: number;
  taxableBenefitsInKind: number;
  taxableGrossIncome: number;
  taxableIncome: number;
  isResident: boolean;
  taxRegime: GRTaxRegime;
  age: number;
  numberOfDependents: number;
  effectiveDependentsForScale: number;
  effectiveAgeForScale: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  incomeTax: {
    grossIncomeTax: number;
    baseTaxReduction: number;
    taxReductionTaper: number;
    availableTaxReduction: number;
    appliedTaxReduction: number;
    finalIncomeTax: number;
  };
  article5CRelief: {
    applies: boolean;
    exemptionRate: number;
    exemptIncome: number;
    eligibleIncome: number;
    maxYears: number;
  };
  socialInsurance: {
    employee: number;
    employer: number;
    employeeRate: number;
    employerRate: number;
    insurableIncome: number;
    monthlyCeiling: number;
    annualCeiling: number;
    salaryInstallments: number;
    mainPensionEmployee: number;
    supplementaryPensionEmployee: number;
    healthcareEmployee: number;
    otherFundsEmployee: number;
  };
  voluntaryContributions: {
    occupationalPension: number;
    pensionContributionLimit: number;
    total: number;
  };
}

declare module "../types" {
  interface CountryCodeMap {
    GR: true;
  }

  interface ContributionInputMap {
    GR: GRContributionInputs;
  }

  interface CalculatorInputMap {
    GR: GRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    GR: GRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    GR: GRBreakdown;
  }
}

export function isGRInputs(
  inputs: CalculatorInputs,
): inputs is GRCalculatorInputs {
  return inputs.country === "GR";
}

export function isGRTaxBreakdown(taxes: TaxBreakdown): taxes is GRTaxBreakdown {
  return "type" in taxes && taxes.type === "GR";
}

export function isGRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is GRBreakdown {
  return breakdown.type === "GR";
}
