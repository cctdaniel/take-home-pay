import type {
  BaseCalculatorInputs,
  CalculatorInputs,
} from "../types";

export interface COContributionInputs {
  afcSavings: number;
  voluntaryPension: number;
}

export interface COCalculatorInputs extends BaseCalculatorInputs {
  country: "CO";
  contributions: COContributionInputs;
}

export interface COTaxBreakdown extends BaseTaxBreakdown {
  type: "CO";
  incomeTax: number;
  pension: number;
  health: number;
  solidarity: number;
}

export interface COBreakdown {
  type: "CO";
  grossIncome: number;
  mandatoryContributions: {
    pensionRate: number;
    healthRate: number;
    solidarityRate: number;
    total: number;
  };
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    afcSavings: number;
    voluntaryPension: number;
    combinedLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap { CO: true; }
  interface CurrencyCodeMap { COP: true; }
  interface ContributionInputMap { CO: COContributionInputs; }
  interface CalculatorInputMap { CO: COCalculatorInputs; }
  interface TaxBreakdownMap { CO: COTaxBreakdown; }
  interface CountrySpecificBreakdownMap { CO: COBreakdown; }
}

export function isCOInputs(inputs: CalculatorInputs): inputs is COCalculatorInputs {
  return inputs.country === "CO";
}
