import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type ECContributionInputs = Record<never, never>;

export interface ECCalculatorInputs extends BaseCalculatorInputs {
  country: "EC";
  contributions: ECContributionInputs;
}

export interface ECTaxBreakdown extends BaseTaxBreakdown {
  type: "EC";
  incomeTax: number;
  iessEmployee: number;
}

export interface ECBreakdown {
  type: "EC";
  grossIncome: number;
  iessEmployee: number;
  incomeAfterIess: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    EC: true;
  }

  interface ContributionInputMap {
    EC: ECContributionInputs;
  }

  interface CalculatorInputMap {
    EC: ECCalculatorInputs;
  }

  interface TaxBreakdownMap {
    EC: ECTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    EC: ECBreakdown;
  }
}

export function isECInputs(inputs: CalculatorInputs): inputs is ECCalculatorInputs {
  return inputs.country === "EC";
}

export function isECTaxBreakdown(taxes: TaxBreakdown): taxes is ECTaxBreakdown {
  return "type" in taxes && taxes.type === "EC";
}

export function isECBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ECBreakdown {
  return breakdown.type === "EC";
}
