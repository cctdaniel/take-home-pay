import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type MEContributionInputs = Record<never, never>;

export interface MECalculatorInputs extends BaseCalculatorInputs {
  country: "ME";
  contributions: MEContributionInputs;
}

export interface METaxBreakdown extends BaseTaxBreakdown {
  type: "ME";
  incomeTax: number;
  pensionEmployee: number;
  unemploymentEmployee: number;
}

export interface MEBreakdown {
  type: "ME";
  grossIncome: number;
  pensionEmployee: number;
  unemploymentEmployee: number;
  monthlyTaxableIncome: number;
  monthlyIncomeTax: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    ME: true;
  }

  interface ContributionInputMap {
    ME: MEContributionInputs;
  }

  interface CalculatorInputMap {
    ME: MECalculatorInputs;
  }

  interface TaxBreakdownMap {
    ME: METaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    ME: MEBreakdown;
  }
}

export function isMEInputs(inputs: CalculatorInputs): inputs is MECalculatorInputs {
  return inputs.country === "ME";
}

export function isMETaxBreakdown(taxes: TaxBreakdown): taxes is METaxBreakdown {
  return "type" in taxes && taxes.type === "ME";
}

export function isMEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MEBreakdown {
  return breakdown.type === "ME";
}
