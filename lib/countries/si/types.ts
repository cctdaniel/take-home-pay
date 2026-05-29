import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type SIContributionInputs = Record<never, never>;

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
  socialInsurance: {
    rate: number;
    employee: number;
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
    SI: true;
  }

  interface ContributionInputMap {
    SI: SIContributionInputs;
  }

  interface CalculatorInputMap {
    SI: SICalculatorInputs;
  }

  interface TaxBreakdownMap {
    SI: SITaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SI: SIBreakdown;
  }
}

export function isSIInputs(
  inputs: CalculatorInputs,
): inputs is SICalculatorInputs {
  return inputs.country === "SI";
}

export function isSITaxBreakdown(taxes: TaxBreakdown): taxes is SITaxBreakdown {
  return "type" in taxes && taxes.type === "SI";
}

export function isSIBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SIBreakdown {
  return breakdown.type === "SI";
}
