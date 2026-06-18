import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type BBContributionInputs = Record<never, never>;

export interface BBCalculatorInputs extends BaseCalculatorInputs {
  country: "BB";
  contributions: BBContributionInputs;
}

export interface BBTaxBreakdown extends BaseTaxBreakdown {
  type: "BB";
  incomeTax: number;
  nisEmployee: number;
  resilienceFund: number;
}

export interface BBBreakdown {
  type: "BB";
  grossIncome: number;
  nisEmployee: number;
  resilienceFund: number;
  payeAllowance: number;
  payeTaxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    BB: true;
  }

  interface CurrencyCodeMap {
    BBD: true;
  }

  interface ContributionInputMap {
    BB: BBContributionInputs;
  }

  interface CalculatorInputMap {
    BB: BBCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BB: BBTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BB: BBBreakdown;
  }
}

export function isBBInputs(inputs: CalculatorInputs): inputs is BBCalculatorInputs {
  return inputs.country === "BB";
}

export function isBBTaxBreakdown(taxes: TaxBreakdown): taxes is BBTaxBreakdown {
  return "type" in taxes && taxes.type === "BB";
}

export function isBBBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BBBreakdown {
  return breakdown.type === "BB";
}
