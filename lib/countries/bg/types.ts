import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface BGContributionInputs {
  voluntaryPension: number;
}

export interface BGCalculatorInputs extends BaseCalculatorInputs {
  country: "BG";
  contributions: BGContributionInputs;
}

export interface BGTaxBreakdown extends BaseTaxBreakdown {
  type: "BG";
  incomeTax: number;
  socialSecurity: number;
}

export interface BGBreakdown {
  type: "BG";
  grossIncome: number;
  socialSecurity: {
    rate: number;
    base: number;
    employee: number;
    annualCap: number;
  };
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
    BG: true;
  }

  interface CalculatorInputMap {
    BG: BGCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BG: BGTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BG: BGBreakdown;
  }

  interface ContributionInputMap {
    BG: BGContributionInputs;
  }
}

export function isBGInputs(inputs: CalculatorInputs): inputs is BGCalculatorInputs {
  return inputs.country === "BG";
}

export function isBGTaxBreakdown(taxes: TaxBreakdown): taxes is BGTaxBreakdown {
  return "type" in taxes && taxes.type === "BG";
}

export function isBGBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BGBreakdown {
  return breakdown.type === "BG";
}
