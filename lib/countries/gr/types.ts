import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type GRResidencyType = "resident" | "non_resident";

export type GRContributionInputs = Record<never, never>;

export interface GRCalculatorInputs extends BaseCalculatorInputs {
  country: "GR";
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
  taxableIncome: number;
  isResident: boolean;
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
