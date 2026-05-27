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

export type HRWorkScenario =
  | "croatian_payroll"
  | "digital_nomad_foreign_employer";

export type HRContributionInputs = Record<never, never>;

export interface HRCalculatorInputs extends BaseCalculatorInputs {
  country: "HR";
  workScenario: HRWorkScenario;
  residencyType: HRResidencyType;
  locality: HRLocalityCode;
  pensionScheme: HRPensionScheme;
  age: number;
  croatianReturneeRelief: boolean;
  hasDependentSpouse: boolean;
  numberOfOtherDependents: number;
  numberOfChildren: number;
  numberOfDisabilityAllowances: number;
  numberOfSevereDisabilityAllowances: number;
  taxableBenefitsInKind: number;
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
  taxableBenefitsInKind: number;
  taxableGrossIncome: number;
  workScenario: HRWorkScenario;
  residencyType: HRResidencyType;
  isResident: boolean;
  isDigitalNomadForeignEmployer: boolean;
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
  taxReliefs: {
    incomeTaxBeforeReliefs: number;
    youthRelief: number;
    youthReliefRate: number;
    returneeRelief: number;
    croatianReturneeReliefApplied: boolean;
  };
  employerContributions: {
    healthInsurance: number;
    healthInsuranceRate: number;
  };
  personalAllowance: {
    basic: number;
    dependentSpouse: number;
    otherDependents: number;
    children: number;
    disability: number;
    severeDisability: number;
    total: number;
    numberOfChildren: number;
    hasDependentSpouse: boolean;
    numberOfOtherDependents: number;
    numberOfDisabilityAllowances: number;
    numberOfSevereDisabilityAllowances: number;
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
