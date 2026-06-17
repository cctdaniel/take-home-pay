import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type DOContributionInputs = Record<never, never>;

export interface DOCalculatorInputs extends BaseCalculatorInputs {
  country: "DO";
  contributions: DOContributionInputs;
}

export interface DOTaxBreakdown extends BaseTaxBreakdown {
  type: "DO";
  incomeTax: number;
  tssEmployee: number;
}

export interface DOBreakdown {
  type: "DO";
  grossIncome: number;
  tssEmployee: number;
  isrExemption: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    DO: true;
  }

  interface CurrencyCodeMap {
    DOP: true;
  }

  interface ContributionInputMap {
    DO: DOContributionInputs;
  }

  interface CalculatorInputMap {
    DO: DOCalculatorInputs;
  }

  interface TaxBreakdownMap {
    DO: DOTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    DO: DOBreakdown;
  }
}

export function isDOInputs(inputs: CalculatorInputs): inputs is DOCalculatorInputs {
  return inputs.country === "DO";
}

export function isDOTaxBreakdown(taxes: TaxBreakdown): taxes is DOTaxBreakdown {
  return "type" in taxes && taxes.type === "DO";
}

export function isDOBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is DOBreakdown {
  return breakdown.type === "DO";
}
