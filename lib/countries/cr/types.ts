import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type CRContributionInputs = Record<never, never>;

export interface CRCalculatorInputs extends BaseCalculatorInputs {
  country: "CR";
  dependentChildren: number;
  /** 0 or 1 — monthly spouse credit when eligible. */
  spouseCredit: number;
  contributions: CRContributionInputs;
}

export interface CRTaxBreakdown extends BaseTaxBreakdown {
  type: "CR";
  incomeTax: number;
  ccssEmployee: number;
}

export interface CRBreakdown {
  type: "CR";
  grossIncome: number;
  monthlyGross: number;
  ccssEmployee: number;
  ccssRate: number;
  monthlyTaxBeforeCredits: number;
  monthlyTaxCredits: number;
  annualTaxCredits: number;
  dependentChildren: number;
  spouseCredit: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    CR: true;
  }

  interface CurrencyCodeMap {
    CRC: true;
  }

  interface ContributionInputMap {
    CR: CRContributionInputs;
  }

  interface CalculatorInputMap {
    CR: CRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CR: CRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CR: CRBreakdown;
  }
}

export function isCRInputs(
  inputs: CalculatorInputs,
): inputs is CRCalculatorInputs {
  return inputs.country === "CR";
}

export function isCRTaxBreakdown(taxes: TaxBreakdown): taxes is CRTaxBreakdown {
  return "type" in taxes && taxes.type === "CR";
}

export function isCRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CRBreakdown {
  return breakdown.type === "CR";
}
