import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface ROContributionInputs {
  /** Pillar III voluntary pension — reduces income tax base up to EUR 400/year. */
  privatePension: number;
}

export interface ROCalculatorInputs extends BaseCalculatorInputs {
  country: "RO";
  numberOfChildren: number;
  contributions: ROContributionInputs;
}

export interface ROTaxBreakdown extends BaseTaxBreakdown {
  type: "RO";
  incomeTax: number;
  cas: number;
  cass: number;
}

export interface ROBreakdown {
  type: "RO";
  grossIncome: number;
  numberOfChildren: number;
  cas: { rate: number; base: number; total: number };
  cass: { rate: number; base: number; total: number };
  personalDeduction: number;
  taxableIncome: number;
  incomeTax: { rate: number; total: number };
  voluntaryContributions: {
    privatePension: number;
    privatePensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    RO: true;
  }

  interface CurrencyCodeMap {
    RON: true;
  }

  interface CalculatorInputMap {
    RO: ROCalculatorInputs;
  }

  interface TaxBreakdownMap {
    RO: ROTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    RO: ROBreakdown;
  }

  interface ContributionInputMap {
    RO: ROContributionInputs;
  }
}

export function isROInputs(
  inputs: CalculatorInputs,
): inputs is ROCalculatorInputs {
  return inputs.country === "RO";
}

export function isROTaxBreakdown(taxes: TaxBreakdown): taxes is ROTaxBreakdown {
  return "type" in taxes && taxes.type === "RO";
}

export function isROBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ROBreakdown {
  return breakdown.type === "RO";
}
