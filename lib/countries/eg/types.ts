import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
} from "../types";

export type EGContributionInputs = Record<never, never>;

export interface EGCalculatorInputs extends BaseCalculatorInputs {
  country: "EG";
  contributions: EGContributionInputs;
}

export interface EGTaxBreakdown extends BaseTaxBreakdown {
  type: "EG";
  incomeTax: number;
  socialInsurance: number;
}

export interface EGBreakdown {
  type: "EG";
  grossIncome: number;
  socialInsurance: number;
  personalExemption: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    EG: true;
  }

  interface CurrencyCodeMap {
    EGP: true;
  }

  interface ContributionInputMap {
    EG: EGContributionInputs;
  }

  interface CalculatorInputMap {
    EG: EGCalculatorInputs;
  }

  interface TaxBreakdownMap {
    EG: EGTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    EG: EGBreakdown;
  }
}

export function isEGInputs(inputs: CalculatorInputs): inputs is EGCalculatorInputs {
  return inputs.country === "EG";
}
