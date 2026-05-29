import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type LVContributionInputs = Record<never, never>;

export interface LVCalculatorInputs extends BaseCalculatorInputs {
  country: "LV";
  contributions: LVContributionInputs;
}

export interface LVTaxBreakdown extends BaseTaxBreakdown {
  type: "LV";
  incomeTax: number;
  socialSecurity: number;
}

export interface LVBreakdown {
  type: "LV";
  grossIncome: number;
  socialSecurity: {
    rate: number;
    base: number;
    employee: number;
    annualCap: number;
  };
  nonTaxableMinimum: number;
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
    LV: true;
  }

  interface ContributionInputMap {
    LV: LVContributionInputs;
  }

  interface CalculatorInputMap {
    LV: LVCalculatorInputs;
  }

  interface TaxBreakdownMap {
    LV: LVTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    LV: LVBreakdown;
  }
}

export function isLVInputs(
  inputs: CalculatorInputs,
): inputs is LVCalculatorInputs {
  return inputs.country === "LV";
}

export function isLVTaxBreakdown(taxes: TaxBreakdown): taxes is LVTaxBreakdown {
  return "type" in taxes && taxes.type === "LV";
}

export function isLVBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is LVBreakdown {
  return breakdown.type === "LV";
}
