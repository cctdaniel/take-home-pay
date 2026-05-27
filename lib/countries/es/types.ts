import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface ESContributionInputs {
  pensionContribution: number;
}

export type ESResidencyType =
  | "resident"
  | "non_resident_eu_eea"
  | "non_resident_other";

export type ESFilingStatus = "individual" | "married_jointly" | "single_parent";

export type ESEmploymentContractType = "permanent" | "fixed_term";

export type ESTaxRegime = "ordinary" | "beckhamLaw";

export interface ESCalculatorInputs extends BaseCalculatorInputs {
  country: "ES";
  residencyType: ESResidencyType;
  taxRegime: ESTaxRegime;
  region: string;
  filingStatus: ESFilingStatus;
  age: number;
  numberOfChildren: number;
  numberOfChildrenUnderThree: number;
  employmentContractType: ESEmploymentContractType;
  contributions: ESContributionInputs;
}

export interface ESTaxBreakdown extends BaseTaxBreakdown {
  type: "ES";
  incomeTax: number;
  stateIncomeTax: number;
  regionalIncomeTax: number;
  socialSecurity: number;
}

export interface ESSolidarityContributionBracket {
  minMonthly: number;
  maxMonthly: number;
  employeeRate: number;
  employerRate: number;
  employee: number;
  employer: number;
}

export interface ESBreakdown {
  type: "ES";
  grossIncome: number;
  residencyType: ESResidencyType;
  taxRegime: ESTaxRegime;
  isBeckhamLaw: boolean;
  isResident: boolean;
  region: string;
  regionName: string;
  filingStatus: ESFilingStatus;
  age: number;
  numberOfChildren: number;
  numberOfChildrenUnderThree: number;
  employmentContractType: ESEmploymentContractType;
  taxableIncome: number;
  workExpenseDeduction: number;
  jointTaxationReduction: number;
  voluntaryContributions: {
    pensionContribution: number;
    pensionContributionLimit: number;
    total: number;
  };
  taxpayerMinimum: number;
  descendantMinimum: number;
  personalFamilyMinimum: number;
  minimumTaxCredit: number;
  incomeTax: number;
  stateIncomeTax: number;
  regionalIncomeTax: number;
  nonResidentRate?: number;
  beckhamLawThreshold?: number;
  beckhamLawFirstRate?: number;
  beckhamLawExcessRate?: number;
  stateGrossTax: number;
  regionalGrossTax: number;
  stateMinimumCredit: number;
  regionalMinimumCredit: number;
  stateBracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  regionalBracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  socialSecurity: {
    monthlyBase: number;
    annualBase: number;
    commonContingencies: number;
    unemployment: number;
    training: number;
    mei: number;
    solidarity: number;
    solidarityEmployer: number;
    solidarityBrackets: ESSolidarityContributionBracket[];
    total: number;
    employer: number;
    commonContingenciesRate: number;
    unemploymentRate: number;
    trainingRate: number;
    meiRate: number;
    monthlyBaseMax: number;
    monthlyBaseMin: number;
  };
  assumptions: {
    irpfRateYear: number;
    socialSecurityYear: number;
    includesRegionalDeductions: boolean;
    includesForalRegimes: boolean;
  };
}

declare module "../types" {
  interface CountryCodeMap {
    ES: true;
  }

  interface ContributionInputMap {
    ES: ESContributionInputs;
  }

  interface CalculatorInputMap {
    ES: ESCalculatorInputs;
  }

  interface TaxBreakdownMap {
    ES: ESTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    ES: ESBreakdown;
  }
}

export function isESInputs(
  inputs: CalculatorInputs,
): inputs is ESCalculatorInputs {
  return inputs.country === "ES";
}

export function isESTaxBreakdown(taxes: TaxBreakdown): taxes is ESTaxBreakdown {
  return "type" in taxes && taxes.type === "ES";
}

export function isESBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ESBreakdown {
  return breakdown.type === "ES";
}
