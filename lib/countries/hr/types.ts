import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";
import type { HRLocalityCode } from "./constants/tax-brackets-2026";

export type HRResidencyType = "resident" | "non_resident";

export type HRPensionScheme = "pillar_1_and_2" | "pillar_1_only";

export type HRContributionInputs = Record<never, never>;

export interface HRCalculatorInputs extends BaseCalculatorInputs {
  country: "HR";
  residencyType: HRResidencyType;
  locality: HRLocalityCode;
  pensionScheme: HRPensionScheme;
  hasDependentSpouse: boolean;
  numberOfChildren: number;
  contributions: HRContributionInputs;
}

export interface HRTaxBreakdown extends BaseTaxBreakdown {
  type: "HR";
  incomeTax: number;
  employeePensionFirstPillar: number;
  employeePensionSecondPillar: number;
}

export interface HRBreakdown {
  type: "HR";
  grossIncome: number;
  residencyType: HRResidencyType;
  isResident: boolean;
  locality: {
    code: HRLocalityCode;
    name: string;
    lowerRate: number;
    higherRate: number;
    nnReference: string;
  };
  pensionScheme: HRPensionScheme;
  pension: {
    contributionBase: number;
    monthlyBase: number;
    monthlyBaseCeiling: number;
    annualBaseCeiling: number;
    firstPillar: number;
    secondPillar: number;
    total: number;
    firstPillarRate: number;
    secondPillarRate: number;
    totalRate: number;
  };
  employerContributions: {
    healthInsurance: number;
    healthInsuranceRate: number;
  };
  personalAllowance: {
    basic: number;
    dependentSpouse: number;
    children: number;
    total: number;
    numberOfChildren: number;
    hasDependentSpouse: boolean;
  };
  taxableIncomeBeforeAllowance: number;
  taxableIncome: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  modeledExclusions: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    HR: true;
  }

  interface ContributionInputMap {
    HR: HRContributionInputs;
  }

  interface CalculatorInputMap {
    HR: HRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    HR: HRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    HR: HRBreakdown;
  }
}

export function isHRInputs(
  inputs: CalculatorInputs,
): inputs is HRCalculatorInputs {
  return inputs.country === "HR";
}

export function isHRTaxBreakdown(taxes: TaxBreakdown): taxes is HRTaxBreakdown {
  return "type" in taxes && taxes.type === "HR";
}

export function isHRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is HRBreakdown {
  return breakdown.type === "HR";
}
