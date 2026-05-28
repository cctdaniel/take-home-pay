import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";

export interface TRContributionInputs {
  /** BES private pension — up to 3% of gross; 30% income tax credit. */
  privatePension: number;
}

export interface TRCalculatorInputs extends BaseCalculatorInputs {
  country: "TR";
  contributions: TRContributionInputs;
}

export interface TRTaxBreakdown extends BaseTaxBreakdown {
  type: "TR";
  incomeTax: number;
  sgk: number;
  unemployment: number;
}

export interface TRBreakdown {
  type: "TR";
  grossIncome: number;
  taxableIncome: number;
  minimumWageExemption: number;
  taxableAfterExemption: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
  sgkBase: number;
  social: {
    sgkRate: number;
    unemploymentRate: number;
    monthlySgkCeiling: number;
  };
  voluntaryContributions: {
    privatePension: number;
    privatePensionLimit: number;
    besTaxCredit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: readonly string[];
}

declare module "../types" {
  interface CountryCodeMap {
    TR: true;
  }

  interface CurrencyCodeMap {
    TRY: true;
  }

  interface ContributionInputMap {
    TR: TRContributionInputs;
  }

  interface CalculatorInputMap {
    TR: TRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    TR: TRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    TR: TRBreakdown;
  }
}

export function isTRInputs(inputs: CalculatorInputs): inputs is TRCalculatorInputs {
  return inputs.country === "TR";
}

export function isTRTaxBreakdown(taxes: TaxBreakdown): taxes is TRTaxBreakdown {
  return "type" in taxes && taxes.type === "TR";
}

export function isTRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is TRBreakdown {
  return breakdown.type === "TR";
}
