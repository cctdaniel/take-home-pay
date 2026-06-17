import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";

export type PEContributionInputs = Record<string, never>;

export interface PECalculatorInputs extends BaseCalculatorInputs {
  country: "PE";
  contributions: PEContributionInputs;
}

export interface PETaxBreakdown extends BaseTaxBreakdown {
  type: "PE";
  incomeTax: number;
  pension: number;
}

export interface PEBreakdown {
  type: "PE";
  grossIncome: number;
  pension: {
    rate: number;
    employee: number;
  };
  workIncomeDeduction: number;
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
    PE: true;
  }

  interface CurrencyCodeMap {
    PEN: true;
  }

  interface CalculatorInputMap {
    PE: PECalculatorInputs;
  }

  interface TaxBreakdownMap {
    PE: PETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PE: PEBreakdown;
  }

  interface ContributionInputMap {
    PE: PEContributionInputs;
  }
}

export function isPEInputs(inputs: CalculatorInputs): inputs is PECalculatorInputs {
  return inputs.country === "PE";
}

export function isPETaxBreakdown(taxes: TaxBreakdown): taxes is PETaxBreakdown {
  return "type" in taxes && taxes.type === "PE";
}

export function isPEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PEBreakdown {
  return breakdown.type === "PE";
}
