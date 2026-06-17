import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface RSContributionInputs {
  voluntaryPension: number;
}

export interface RSCalculatorInputs extends BaseCalculatorInputs {
  country: "RS";
  contributions: RSContributionInputs;
}

export interface RSTaxBreakdown extends BaseTaxBreakdown {
  type: "RS";
  incomeTax: number;
  socialSecurity: number;
}

export interface RSBreakdown {
  type: "RS";
  grossIncome: number;
  socialSecurity: {
    rate: number;
    base: number;
    employee: number;
    annualCap: number;
  };
  nonTaxableAmount: number;
  taxableIncome: number;
  incomeTax: { rate: number; total: number };
  voluntaryContributions: {
    voluntaryPension: number;
    voluntaryPensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    RS: true;
  }

  interface CurrencyCodeMap {
    RSD: true;
  }

  interface CalculatorInputMap {
    RS: RSCalculatorInputs;
  }

  interface TaxBreakdownMap {
    RS: RSTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    RS: RSBreakdown;
  }

  interface ContributionInputMap {
    RS: RSContributionInputs;
  }
}

export function isRSInputs(inputs: CalculatorInputs): inputs is RSCalculatorInputs {
  return inputs.country === "RS";
}

export function isRSTaxBreakdown(taxes: TaxBreakdown): taxes is RSTaxBreakdown {
  return "type" in taxes && taxes.type === "RS";
}

export function isRSBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is RSBreakdown {
  return breakdown.type === "RS";
}
