import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
} from "../types";

export type BDContributionInputs = Record<never, never>;

export interface BDCalculatorInputs extends BaseCalculatorInputs {
  country: "BD";
  contributions: BDContributionInputs;
}

export interface BDTaxBreakdown extends BaseTaxBreakdown {
  type: "BD";
  incomeTax: number;
}

export interface BDBreakdown {
  type: "BD";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    BD: true;
  }

  interface CurrencyCodeMap {
    BDT: true;
  }

  interface ContributionInputMap {
    BD: BDContributionInputs;
  }

  interface CalculatorInputMap {
    BD: BDCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BD: BDTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BD: BDBreakdown;
  }
}

export function isBDInputs(inputs: CalculatorInputs): inputs is BDCalculatorInputs {
  return inputs.country === "BD";
}
