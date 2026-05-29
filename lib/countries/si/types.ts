import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
} from "../types";

export interface SIContributionInputs {
  supplementaryPension: number;
}

export interface SICalculatorInputs extends BaseCalculatorInputs {
  country: "SI";
  contributions: SIContributionInputs;
}

export interface SITaxBreakdown extends BaseTaxBreakdown {
  type: "SI";
  incomeTax: number;
  socialInsurance: number;
}

export interface SIBreakdown {
  type: "SI";
  grossIncome: number;
  socialInsurance: { rate: number; employee: number };
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    supplementaryPension: number;
    supplementaryPensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap { SI: true; }
  interface ContributionInputMap { SI: SIContributionInputs; }
  interface CalculatorInputMap { SI: SICalculatorInputs; }
  interface TaxBreakdownMap { SI: SITaxBreakdown; }
  interface CountrySpecificBreakdownMap { SI: SIBreakdown; }
}

export function isSIInputs(inputs: CalculatorInputs): inputs is SICalculatorInputs {
  return inputs.country === "SI";
}
