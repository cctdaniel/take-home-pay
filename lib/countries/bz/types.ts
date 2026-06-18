import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type BZContributionInputs = Record<never, never>;

export interface BZCalculatorInputs extends BaseCalculatorInputs {
  country: "BZ";
  contributions: BZContributionInputs;
}

export interface BZTaxBreakdown extends BaseTaxBreakdown {
  type: "BZ";
  incomeTax: number;
  socialSecurity: number;
}

export interface BZBreakdown {
  type: "BZ";
  grossIncome: number;
  socialSecurity: number;
  pitExemption: number;
  taxableIncome: number;
  incomeTax: { total: number; rate: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    BZ: true;
  }

  interface CurrencyCodeMap {
    BZD: true;
  }

  interface ContributionInputMap {
    BZ: BZContributionInputs;
  }

  interface CalculatorInputMap {
    BZ: BZCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BZ: BZTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BZ: BZBreakdown;
  }
}

export function isBZInputs(inputs: CalculatorInputs): inputs is BZCalculatorInputs {
  return inputs.country === "BZ";
}

export function isBZTaxBreakdown(taxes: TaxBreakdown): taxes is BZTaxBreakdown {
  return "type" in taxes && taxes.type === "BZ";
}

export function isBZBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BZBreakdown {
  return breakdown.type === "BZ";
}
