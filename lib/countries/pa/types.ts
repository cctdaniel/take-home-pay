import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type PAContributionInputs = Record<never, never>;

export interface PACalculatorInputs extends BaseCalculatorInputs {
  country: "PA";
  contributions: PAContributionInputs;
}

export interface PATaxBreakdown extends BaseTaxBreakdown {
  type: "PA";
  incomeTax: number;
  cssEmployee: number;
  educationEmployee: number;
}

export interface PABreakdown {
  type: "PA";
  grossIncome: number;
  cssEmployee: number;
  educationEmployee: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    PA: true;
  }

  interface ContributionInputMap {
    PA: PAContributionInputs;
  }

  interface CalculatorInputMap {
    PA: PACalculatorInputs;
  }

  interface TaxBreakdownMap {
    PA: PATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PA: PABreakdown;
  }
}

export function isPAInputs(inputs: CalculatorInputs): inputs is PACalculatorInputs {
  return inputs.country === "PA";
}

export function isPATaxBreakdown(taxes: TaxBreakdown): taxes is PATaxBreakdown {
  return "type" in taxes && taxes.type === "PA";
}

export function isPABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PABreakdown {
  return breakdown.type === "PA";
}
