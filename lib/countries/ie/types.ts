import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type IETaxStatus =
  | "single"
  | "married_one_income"
  | "married_two_incomes";

export type IERetirementScheme =
  | "none"
  | "private_pension"
  | "my_future_fund";

export type IESarpRegime =
  | "none"
  | "arrived_2023_to_2025"
  | "arrived_2026_onwards";

export interface IEContributionInputs {
  pensionContribution: number;
  qualifyingRentPaid: number;
  healthExpenses: number;
  flatRateExpenses: number;
}

export interface IECalculatorInputs extends BaseCalculatorInputs {
  country: "IE";
  age: number;
  taxableBenefitsInKind: number;
  taxStatus: IETaxStatus;
  retirementScheme: IERetirementScheme;
  hasSinglePersonChildCarerCredit: boolean;
  hasHomeCarerTaxCredit: boolean;
  homeCarerIncome: number;
  numberOfDependentRelatives: number;
  hasReducedUSC: boolean;
  sarpRegime: IESarpRegime;
  contributions: IEContributionInputs;
}

export interface IETaxBreakdown extends BaseTaxBreakdown {
  type: "IE";
  incomeTax: number;
  employeeSocialContribution: number;
  additionalIncomeTax: number;
}

export interface IEBreakdown {
  type: "IE";
  grossIncome: number;
  taxableBenefitsInKind: number;
  taxablePayForPayroll: number;
  taxableIncome: number;
  standardDeduction: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
  standardRateBand: number;
  personalTaxCredit: number;
  employeeTaxCredit: number;
  taxCreditDetails: {
    singlePersonChildCarer: number;
    homeCarer: number;
    dependentRelative: number;
    rent: number;
    healthExpenses: number;
  };
  taxStatus: IETaxStatus;
  age: number;
  sarpRelief: {
    regime: IESarpRegime;
    applies: boolean;
    reliefAmount: number;
    reliefRate: number;
    incomeThreshold: number;
    upperIncomeLimit: number;
    maxYears: number;
  };
  retirementScheme: IERetirementScheme;
  pensionContribution: number;
  pensionDeduction: number;
  pensionReliefPercent: number;
  pensionReliefLimit: number;
  disallowedPensionContribution: number;
  flatRateExpenses: number;
  qualifyingRentPaid: number;
  healthExpenses: number;
  employeeSocialContribution: {
    name: string;
    amount: number;
    effectiveRate: number;
    preOctoberRate: number;
    postOctoberRate: number;
    weeklyIncome: number;
  };
  additionalIncomeTax: {
    name: string;
    amount: number;
    reducedRateApplied: boolean;
  };
  myFutureFund: {
    employeeContribution: number;
    employerContribution: number;
    stateTopUp: number;
    contributionBase: number;
    employeeRate: number;
    employerRate: number;
    stateRate: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    IE: true;
  }

  interface ContributionInputMap {
    IE: IEContributionInputs;
  }

  interface CalculatorInputMap {
    IE: IECalculatorInputs;
  }

  interface TaxBreakdownMap {
    IE: IETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    IE: IEBreakdown;
  }
}

export function isIEInputs(
  inputs: CalculatorInputs,
): inputs is IECalculatorInputs {
  return inputs.country === "IE";
}

export function isIETaxBreakdown(taxes: TaxBreakdown): taxes is IETaxBreakdown {
  return "type" in taxes && taxes.type === "IE";
}

export function isIEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is IEBreakdown {
  return breakdown.type === "IE";
}
