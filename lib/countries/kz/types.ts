import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type KZContributionInputs = Record<never, never>;

export interface KZCalculatorInputs extends BaseCalculatorInputs {
  country: "KZ";
  contributions: KZContributionInputs;
}

export interface KZTaxBreakdown extends BaseTaxBreakdown {
  type: "KZ";
  incomeTax: number;
  opcEmployee: number;
  omicEmployee: number;
}

export interface KZBreakdown {
  type: "KZ";
  grossIncome: number;
  standardDeduction: number;
  opcEmployee: number;
  omicEmployee: number;
  omicMonthlyCap: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    KZ: true;
  }

  interface CurrencyCodeMap {
    KZT: true;
  }

  interface ContributionInputMap {
    KZ: KZContributionInputs;
  }

  interface CalculatorInputMap {
    KZ: KZCalculatorInputs;
  }

  interface TaxBreakdownMap {
    KZ: KZTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    KZ: KZBreakdown;
  }
}

export function isKZInputs(
  inputs: CalculatorInputs,
): inputs is KZCalculatorInputs {
  return inputs.country === "KZ";
}

export function isKZTaxBreakdown(taxes: TaxBreakdown): taxes is KZTaxBreakdown {
  return "type" in taxes && taxes.type === "KZ";
}

export function isKZBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KZBreakdown {
  return breakdown.type === "KZ";
}
