import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type MUContributionInputs = Record<never, never>;

export interface MUCalculatorInputs extends BaseCalculatorInputs {
  country: "MU";
  contributions: MUContributionInputs;
}

export interface MUTaxBreakdown extends BaseTaxBreakdown {
  type: "MU";
  incomeTax: number;
  csgEmployee: number;
}

export interface MUBreakdown {
  type: "MU";
  grossIncome: number;
  csgEmployee: number;
  csgRate: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    MU: true;
  }

  interface CurrencyCodeMap {
    MUR: true;
  }

  interface ContributionInputMap {
    MU: MUContributionInputs;
  }

  interface CalculatorInputMap {
    MU: MUCalculatorInputs;
  }

  interface TaxBreakdownMap {
    MU: MUTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    MU: MUBreakdown;
  }
}

export function isMUInputs(inputs: CalculatorInputs): inputs is MUCalculatorInputs {
  return inputs.country === "MU";
}

export function isMUTaxBreakdown(taxes: TaxBreakdown): taxes is MUTaxBreakdown {
  return "type" in taxes && taxes.type === "MU";
}

export function isMUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MUBreakdown {
  return breakdown.type === "MU";
}
