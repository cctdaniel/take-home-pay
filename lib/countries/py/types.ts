import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type PYContributionInputs = Record<never, never>;

export interface PYCalculatorInputs extends BaseCalculatorInputs {
  country: "PY";
  contributions: PYContributionInputs;
}

export interface PYTaxBreakdown extends BaseTaxBreakdown {
  type: "PY";
  incomeTax: number;
  ipsEmployee: number;
}

export interface PYBreakdown {
  type: "PY";
  grossIncome: number;
  ipsEmployee: number;
  irpTaxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    PY: true;
  }

  interface CurrencyCodeMap {
    PYG: true;
  }

  interface ContributionInputMap {
    PY: PYContributionInputs;
  }

  interface CalculatorInputMap {
    PY: PYCalculatorInputs;
  }

  interface TaxBreakdownMap {
    PY: PYTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PY: PYBreakdown;
  }
}

export function isPYInputs(inputs: CalculatorInputs): inputs is PYCalculatorInputs {
  return inputs.country === "PY";
}

export function isPYTaxBreakdown(taxes: TaxBreakdown): taxes is PYTaxBreakdown {
  return "type" in taxes && taxes.type === "PY";
}

export function isPYBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PYBreakdown {
  return breakdown.type === "PY";
}
