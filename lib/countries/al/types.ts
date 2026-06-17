import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type ALContributionInputs = Record<never, never>;

export interface ALCalculatorInputs extends BaseCalculatorInputs {
  country: "AL";
  contributions: ALContributionInputs;
}

export interface ALTaxBreakdown extends BaseTaxBreakdown {
  type: "AL";
  incomeTax: number;
  socialInsurance: number;
}

export interface ALBreakdown {
  type: "AL";
  grossIncome: number;
  socialInsurance: number;
  personalDeduction: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    AL: true;
  }

  interface CurrencyCodeMap {
    ALL: true;
  }

  interface ContributionInputMap {
    AL: ALContributionInputs;
  }

  interface CalculatorInputMap {
    AL: ALCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AL: ALTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AL: ALBreakdown;
  }
}

export function isALInputs(inputs: CalculatorInputs): inputs is ALCalculatorInputs {
  return inputs.country === "AL";
}

export function isALTaxBreakdown(taxes: TaxBreakdown): taxes is ALTaxBreakdown {
  return "type" in taxes && taxes.type === "AL";
}

export function isALBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ALBreakdown {
  return breakdown.type === "AL";
}
