import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type FIContributionInputs = Record<never, never>;

export interface FICalculatorInputs extends BaseCalculatorInputs {
  country: "FI";
  contributions: FIContributionInputs;
}

export interface FITaxBreakdown extends BaseTaxBreakdown {
  type: "FI";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface FIBreakdown {
  type: "FI";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  standardDeduction: number;
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    FI: true;
  }

  interface ContributionInputMap {
    FI: FIContributionInputs;
  }

  interface CalculatorInputMap {
    FI: FICalculatorInputs;
  }

  interface TaxBreakdownMap {
    FI: FITaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    FI: FIBreakdown;
  }
}

export function isFIInputs(inputs: CalculatorInputs): inputs is FICalculatorInputs {
  return inputs.country === "FI";
}

export function isFITaxBreakdown(taxes: TaxBreakdown): taxes is FITaxBreakdown {
  return "type" in taxes && taxes.type === "FI";
}

export function isFIBreakdown(breakdown: CountrySpecificBreakdown): breakdown is FIBreakdown {
  return breakdown.type === "FI";
}
