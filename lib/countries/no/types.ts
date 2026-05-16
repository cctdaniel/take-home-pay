import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface NOContributionInputs {
  ipsContribution: number;
}

export interface NOCalculatorInputs extends BaseCalculatorInputs {
  country: "NO";
  contributions: NOContributionInputs;
}

export interface NOTaxBreakdown extends BaseTaxBreakdown {
  type: "NO";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface NOBreakdown {
  type: "NO";
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
  voluntaryContributions: {
    ipsContribution: number;
    ipsDeductionApplied: number;
    ipsDeductionLimit: number;
  };
}

declare module "../types" {
  interface CurrencyCodeMap {
    NOK: true;
  }

  interface CountryCodeMap {
    NO: true;
  }

  interface ContributionInputMap {
    NO: NOContributionInputs;
  }

  interface CalculatorInputMap {
    NO: NOCalculatorInputs;
  }

  interface TaxBreakdownMap {
    NO: NOTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    NO: NOBreakdown;
  }
}

export function isNOInputs(inputs: CalculatorInputs): inputs is NOCalculatorInputs {
  return inputs.country === "NO";
}

export function isNOTaxBreakdown(taxes: TaxBreakdown): taxes is NOTaxBreakdown {
  return "type" in taxes && taxes.type === "NO";
}

export function isNOBreakdown(breakdown: CountrySpecificBreakdown): breakdown is NOBreakdown {
  return breakdown.type === "NO";
}
