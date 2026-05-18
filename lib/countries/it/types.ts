import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface ITContributionInputs {
  pensionContribution: number;
}

export interface ITCalculatorInputs extends BaseCalculatorInputs {
  country: "IT";
  contributions: ITContributionInputs;
}

export interface ITTaxBreakdown extends BaseTaxBreakdown {
  type: "IT";
  incomeTax: number;
  employeeSocialContribution: number;
  additionalIncomeTax: number;
}

export interface ITBreakdown {
  type: "IT";
  grossIncome: number;
  taxableIncome: number;
  standardDeduction: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
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
    IT: true;
  }

  interface ContributionInputMap {
    IT: ITContributionInputs;
  }

  interface CalculatorInputMap {
    IT: ITCalculatorInputs;
  }

  interface TaxBreakdownMap {
    IT: ITTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    IT: ITBreakdown;
  }
}

export function isITInputs(
  inputs: CalculatorInputs,
): inputs is ITCalculatorInputs {
  return inputs.country === "IT";
}

export function isITTaxBreakdown(taxes: TaxBreakdown): taxes is ITTaxBreakdown {
  return "type" in taxes && taxes.type === "IT";
}

export function isITBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ITBreakdown {
  return breakdown.type === "IT";
}
