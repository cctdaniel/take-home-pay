import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type DKContributionInputs = Record<never, never>;

export interface DKCalculatorInputs extends BaseCalculatorInputs {
  country: "DK";
  contributions: DKContributionInputs;
}

export interface DKTaxBreakdown extends BaseTaxBreakdown {
  type: "DK";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface DKBreakdown {
  type: "DK";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  standardDeduction: number;
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    DKK: true;
  }

  interface CountryCodeMap {
    DK: true;
  }

  interface ContributionInputMap {
    DK: DKContributionInputs;
  }

  interface CalculatorInputMap {
    DK: DKCalculatorInputs;
  }

  interface TaxBreakdownMap {
    DK: DKTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    DK: DKBreakdown;
  }
}

export function isDKInputs(inputs: CalculatorInputs): inputs is DKCalculatorInputs {
  return inputs.country === "DK";
}

export function isDKTaxBreakdown(taxes: TaxBreakdown): taxes is DKTaxBreakdown {
  return "type" in taxes && taxes.type === "DK";
}

export function isDKBreakdown(breakdown: CountrySpecificBreakdown): breakdown is DKBreakdown {
  return breakdown.type === "DK";
}
