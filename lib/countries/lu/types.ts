import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface LUContributionInputs {
  /** Article 111bis private pension (épargne-pension) — reduces taxable income. */
  privatePension: number;
}

export interface LUCalculatorInputs extends BaseCalculatorInputs {
  country: "LU";
  contributions: LUContributionInputs;
}

export interface LUTaxBreakdown extends BaseTaxBreakdown {
  type: "LU";
  incomeTax: number;
  employeeSocial: number;
}

export interface LUBreakdown {
  type: "LU";
  grossIncome: number;
  employeeSocial: {
    rate: number;
    base: number;
    cap: number;
    total: number;
  };
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
    LU: true;
  }

  interface CalculatorInputMap {
    LU: LUCalculatorInputs;
  }

  interface TaxBreakdownMap {
    LU: LUTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    LU: LUBreakdown;
  }

  interface ContributionInputMap {
    LU: LUContributionInputs;
  }
}

export function isLUInputs(
  inputs: CalculatorInputs,
): inputs is LUCalculatorInputs {
  return inputs.country === "LU";
}

export function isLUTaxBreakdown(taxes: TaxBreakdown): taxes is LUTaxBreakdown {
  return "type" in taxes && taxes.type === "LU";
}

export function isLUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is LUBreakdown {
  return breakdown.type === "LU";
}
