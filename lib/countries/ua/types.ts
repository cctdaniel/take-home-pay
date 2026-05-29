import type {
  BaseCalculatorInputs,
  CalculatorInputs,
} from "../types";

export interface UAContributionInputs {
  npfContribution: number;
}

export interface UACalculatorInputs extends BaseCalculatorInputs {
  country: "UA";
  contributions: UAContributionInputs;
}

export interface UATaxBreakdown extends BaseTaxBreakdown {
  type: "UA";
  incomeTax: number;
  militaryTax: number;
  npfTaxDiscount: number;
}

export interface UABreakdown {
  type: "UA";
  grossIncome: number;
  incomeTax: { rate: number; total: number };
  militaryTax: { rate: number; total: number };
  employerUsc: { rate: number; base: number; total: number };
  voluntaryContributions: {
    npfContribution: number;
    npfLimit: number;
    npfTaxDiscount: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap { UA: true; }
  interface CurrencyCodeMap { UAH: true; }
  interface ContributionInputMap { UA: UAContributionInputs; }
  interface CalculatorInputMap { UA: UACalculatorInputs; }
  interface TaxBreakdownMap { UA: UATaxBreakdown; }
  interface CountrySpecificBreakdownMap { UA: UABreakdown; }
}

export function isUAInputs(inputs: CalculatorInputs): inputs is UACalculatorInputs {
  return inputs.country === "UA";
}
