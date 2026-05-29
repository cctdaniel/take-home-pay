import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type UAContributionInputs = Record<never, never>;

export interface UACalculatorInputs extends BaseCalculatorInputs {
  country: "UA";
  contributions: UAContributionInputs;
}

export interface UATaxBreakdown extends BaseTaxBreakdown {
  type: "UA";
  incomeTax: number;
  militaryTax: number;
}

export interface UABreakdown {
  type: "UA";
  grossIncome: number;
  incomeTax: {
    rate: number;
    total: number;
  };
  militaryTax: {
    rate: number;
    total: number;
  };
  employerUsc: {
    rate: number;
    base: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    UA: true;
  }

  interface CurrencyCodeMap {
    UAH: true;
  }

  interface CalculatorInputMap {
    UA: UACalculatorInputs;
  }

  interface TaxBreakdownMap {
    UA: UATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    UA: UABreakdown;
  }

  interface ContributionInputMap {
    UA: UAContributionInputs;
  }
}

export function isUAInputs(
  inputs: CalculatorInputs,
): inputs is UACalculatorInputs {
  return inputs.country === "UA";
}

export function isUATaxBreakdown(taxes: TaxBreakdown): taxes is UATaxBreakdown {
  return "type" in taxes && taxes.type === "UA";
}

export function isUABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is UABreakdown {
  return breakdown.type === "UA";
}
