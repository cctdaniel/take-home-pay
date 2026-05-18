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

export interface IEContributionInputs {
  pensionContribution: number;
}

export interface IECalculatorInputs extends BaseCalculatorInputs {
  country: "IE";
  taxStatus: IETaxStatus;
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
  taxableIncome: number;
  standardDeduction: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
  taxStatus: IETaxStatus;
  pensionContribution: number;
  pensionDeduction: number;
  disallowedPensionContribution: number;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  additionalIncomeTax: {
    name: string;
    amount: number;
    rate: number;
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
