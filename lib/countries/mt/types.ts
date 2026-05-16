import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type MTResidencyType = "resident" | "non_resident";

export type MTTaxStatus =
  | "single"
  | "married"
  | "married_one_child"
  | "married_two_or_more_children"
  | "parent"
  | "parent_one_child"
  | "parent_two_or_more_children";

export type MTSSCBirthCohort = "born_1962_or_later" | "born_before_1962";

export type MTLowIncomeSscOption = "standard" | "pro_rata";

export type MTSchoolFeeLevel =
  | "none"
  | "kindergarten"
  | "primary"
  | "secondary";

export interface MTContributionInputs {
  personalRetirementScheme: number;
  voluntaryOccupationalPension: number;
}

export interface MTTaxReliefInputs {
  schoolLevel: MTSchoolFeeLevel;
  schoolFees: number;
  childcareFees: number;
  sportsFees: number;
  culturalFees: number;
}

export interface MTCalculatorInputs extends BaseCalculatorInputs {
  country: "MT";
  residencyType: MTResidencyType;
  taxStatus: MTTaxStatus;
  sscBirthCohort: MTSSCBirthCohort;
  lowIncomeSscOption: MTLowIncomeSscOption;
  contributions: MTContributionInputs;
  taxReliefs: MTTaxReliefInputs;
}

export interface MTTaxBreakdown extends BaseTaxBreakdown {
  type: "MT";
  incomeTax: number;
  socialSecurity: number;
}

export interface MTBreakdown {
  type: "MT";
  grossIncome: number;
  taxableIncome: number;
  chargeableIncome: number;
  isResident: boolean;
  residencyType: MTResidencyType;
  taxStatus: MTTaxStatus;
  taxScheduleName: string;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  incomeDeductions: {
    employmentIncomeDeduction: number;
    schoolFees: number;
    childcareFees: number;
    sportsFees: number;
    culturalFees: number;
    total: number;
  };
  taxCredits: {
    personalRetirementScheme: number;
    voluntaryOccupationalPension: number;
    total: number;
    grossIncomeTax: number;
    finalIncomeTax: number;
  };
  socialSecurity: {
    category: "B" | "C" | "D";
    birthCohort: MTSSCBirthCohort;
    lowIncomeOption: MTLowIncomeSscOption;
    basicWeeklyWage: number;
    employeeWeekly: number;
    employerWeekly: number;
    maternityLeaveFundWeekly: number;
    employeeAnnual: number;
    employerAnnual: number;
    maternityLeaveFundAnnual: number;
    employeeRate: number;
    employerRate: number;
    annualContributionWage: number;
  };
  voluntaryContributions: {
    personalRetirementScheme: number;
    voluntaryOccupationalPension: number;
    total: number;
  };
  assumptions: {
    ordinaryEmploymentOnly: true;
    excludesNomadResidencePermit: true;
    excludesSpecialTaxStatuses: true;
    excludesUnder18AndApprenticeSsc: true;
  };
}

declare module "../types" {
  interface CountryCodeMap {
    MT: true;
  }

  interface ContributionInputMap {
    MT: MTContributionInputs;
  }

  interface CalculatorInputMap {
    MT: MTCalculatorInputs;
  }

  interface TaxBreakdownMap {
    MT: MTTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    MT: MTBreakdown;
  }
}

export function isMTInputs(
  inputs: CalculatorInputs,
): inputs is MTCalculatorInputs {
  return inputs.country === "MT";
}

export function isMTTaxBreakdown(taxes: TaxBreakdown): taxes is MTTaxBreakdown {
  return "type" in taxes && taxes.type === "MT";
}

export function isMTBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MTBreakdown {
  return breakdown.type === "MT";
}
