import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface FIContributionInputs {
  voluntaryPension: number;
}

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
  voluntaryContributions?: {
    voluntaryPension: number;
    voluntaryPensionLimit: number;
    total: number;
  };
}

declare module "../types" {
  interface CurrencyCodeMap {
    EUR: true;
  }

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
