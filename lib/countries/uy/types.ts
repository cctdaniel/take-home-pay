import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";

export type UYContributionInputs = Record<string, never>;

export interface UYCalculatorInputs extends BaseCalculatorInputs {
  country: "UY";
  contributions: UYContributionInputs;
}

export interface UYTaxBreakdown extends BaseTaxBreakdown {
  type: "UY";
  incomeTax: number;
  socialSecurity: number;
}

export interface UYBreakdown {
  type: "UY";
  grossIncome: number;
  socialSecurity: {
    rate: number;
    bpsRate: number;
    frlRate: number;
    fonasaRate: number;
    employee: number;
  };
  mnigAnnual: number;
  taxableIncome: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    UY: true;
  }

  interface CurrencyCodeMap {
    UYU: true;
  }

  interface CalculatorInputMap {
    UY: UYCalculatorInputs;
  }

  interface TaxBreakdownMap {
    UY: UYTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    UY: UYBreakdown;
  }

  interface ContributionInputMap {
    UY: UYContributionInputs;
  }
}

export function isUYInputs(inputs: CalculatorInputs): inputs is UYCalculatorInputs {
  return inputs.country === "UY";
}

export function isUYTaxBreakdown(taxes: TaxBreakdown): taxes is UYTaxBreakdown {
  return "type" in taxes && taxes.type === "UY";
}

export function isUYBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is UYBreakdown {
  return breakdown.type === "UY";
}
