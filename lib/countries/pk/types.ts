import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type PKContributionInputs = Record<never, never>;

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
  incomeTax: {
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    PK: true;
  }

  interface CurrencyCodeMap {
    PKR: true;
  }

  interface CalculatorInputMap {
    PK: PKCalculatorInputs;
  }

  interface TaxBreakdownMap {
    PK: PKTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PK: PKBreakdown;
  }

  interface ContributionInputMap {
    PK: PKContributionInputs;
  }
}

export function isPKInputs(
  inputs: CalculatorInputs,
): inputs is PKCalculatorInputs {
  return inputs.country === "PK";
}

export function isPKTaxBreakdown(taxes: TaxBreakdown): taxes is PKTaxBreakdown {
  return "type" in taxes && taxes.type === "PK";
}

export function isPKBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PKBreakdown {
  return breakdown.type === "PK";
}
