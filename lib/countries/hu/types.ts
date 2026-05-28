import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface HUContributionInputs {
  /** Voluntary pension fund — reduces PIT base before 15%. */
  voluntaryPension: number;
}

export interface HUCalculatorInputs extends BaseCalculatorInputs {
  country: "HU";
  numberOfChildren: number;
  under25FullExemption: boolean;
  contributions: HUContributionInputs;
}

export interface HUTaxBreakdown extends BaseTaxBreakdown {
  type: "HU";
  incomeTax: number;
  socialSecurity: number;
}

export interface HUBreakdown {
  type: "HU";
  grossIncome: number;
  familyAllowance: number;
  taxableIncome: number;
  under25FullExemption: boolean;
  numberOfChildren: number;
  incomeTax: {
    rate: number;
    total: number;
  };
  socialSecurity: {
    rate: number;
    total: number;
  };
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
    HU: true;
  }

  interface CurrencyCodeMap {
    HUF: true;
  }

  interface CalculatorInputMap {
    HU: HUCalculatorInputs;
  }

  interface TaxBreakdownMap {
    HU: HUTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    HU: HUBreakdown;
  }

  interface ContributionInputMap {
    HU: HUContributionInputs;
  }
}

export function isHUInputs(
  inputs: CalculatorInputs,
): inputs is HUCalculatorInputs {
  return inputs.country === "HU";
}

export function isHUTaxBreakdown(taxes: TaxBreakdown): taxes is HUTaxBreakdown {
  return "type" in taxes && taxes.type === "HU";
}

export function isHUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is HUBreakdown {
  return breakdown.type === "HU";
}
