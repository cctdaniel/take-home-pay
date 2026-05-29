import type {
  BaseCalculatorInputs,
  CalculatorInputs,
} from "../types";

export interface PKContributionInputs {
  vpsContribution: number;
}

export interface PKCalculatorInputs extends BaseCalculatorInputs {
  country: "PK";
  contributions: PKContributionInputs;
}

export interface PKTaxBreakdown extends BaseTaxBreakdown {
  type: "PK";
  incomeTax: number;
}

export interface PKBreakdown {
  type: "PK";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    vpsContribution: number;
    vpsLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap { PK: true; }
  interface CurrencyCodeMap { PKR: true; }
  interface ContributionInputMap { PK: PKContributionInputs; }
  interface CalculatorInputMap { PK: PKCalculatorInputs; }
  interface TaxBreakdownMap { PK: PKTaxBreakdown; }
  interface CountrySpecificBreakdownMap { PK: PKBreakdown; }
}

export function isPKInputs(inputs: CalculatorInputs): inputs is PKCalculatorInputs {
  return inputs.country === "PK";
}
