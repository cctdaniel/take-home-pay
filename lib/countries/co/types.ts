import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type COContributionInputs = Record<never, never>;

export interface COCalculatorInputs extends BaseCalculatorInputs {
  country: "CO";
  contributions: COContributionInputs;
}

export interface COTaxBreakdown extends BaseTaxBreakdown {
  type: "CO";
  incomeTax: number;
  pension: number;
  health: number;
  solidarity: number;
}

export interface COBreakdown {
  type: "CO";
  grossIncome: number;
  mandatoryContributions: {
    pensionRate: number;
    healthRate: number;
    solidarityRate: number;
    total: number;
  };
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: {
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    CO: true;
  }

  interface CurrencyCodeMap {
    COP: true;
  }

  interface CalculatorInputMap {
    CO: COCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CO: COTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CO: COBreakdown;
  }

  interface ContributionInputMap {
    CO: COContributionInputs;
  }
}

export function isCOInputs(
  inputs: CalculatorInputs,
): inputs is COCalculatorInputs {
  return inputs.country === "CO";
}

export function isCOTaxBreakdown(taxes: TaxBreakdown): taxes is COTaxBreakdown {
  return "type" in taxes && taxes.type === "CO";
}

export function isCOBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is COBreakdown {
  return breakdown.type === "CO";
}
