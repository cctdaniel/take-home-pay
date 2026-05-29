import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface SEContributionInputs {
  ipsContribution: number;
}

export interface SECalculatorInputs extends BaseCalculatorInputs {
  country: "SE";
  contributions: SEContributionInputs;
}

export interface SETaxBreakdown extends BaseTaxBreakdown {
  type: "SE";
  incomeTax: number;
  employeeSocialContribution: number;
  employeeSocialTaxCredit: number;
}

export interface SEBreakdown {
  type: "SE";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  employeeSocialTaxCredit: number;
  standardDeduction: number;
  assumptions: string[];
  sourceUrls: string[];
  voluntaryContributions?: {
    ipsContribution: number;
    ipsDeductionLimit: number;
    total: number;
  };
}

declare module "../types" {
  interface CurrencyCodeMap {
    SEK: true;
  }

  interface CountryCodeMap {
    SE: true;
  }

  interface ContributionInputMap {
    SE: SEContributionInputs;
  }

  interface CalculatorInputMap {
    SE: SECalculatorInputs;
  }

  interface TaxBreakdownMap {
    SE: SETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SE: SEBreakdown;
  }
}

export function isSEInputs(inputs: CalculatorInputs): inputs is SECalculatorInputs {
  return inputs.country === "SE";
}

export function isSETaxBreakdown(taxes: TaxBreakdown): taxes is SETaxBreakdown {
  return "type" in taxes && taxes.type === "SE";
}

export function isSEBreakdown(breakdown: CountrySpecificBreakdown): breakdown is SEBreakdown {
  return breakdown.type === "SE";
}
