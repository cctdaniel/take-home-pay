import type {
  BaseCalculatorInputs,
  CalculatorInputs,
} from "../types";

export interface LVContributionInputs {
  privatePension: number;
}

export interface LVCalculatorInputs extends BaseCalculatorInputs {
  country: "LV";
  contributions: LVContributionInputs;
}

export interface LVTaxBreakdown extends BaseTaxBreakdown {
  type: "LV";
  incomeTax: number;
  socialSecurity: number;
}

export interface LVBreakdown {
  type: "LV";
  grossIncome: number;
  socialSecurity: {
    rate: number;
    base: number;
    employee: number;
    annualCap: number;
  };
  nonTaxableMinimum: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    privatePension: number;
    privatePensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    LV: true;
  }
  interface ContributionInputMap {
    LV: LVContributionInputs;
  }
  interface CalculatorInputMap {
    LV: LVCalculatorInputs;
  }
  interface TaxBreakdownMap {
    LV: LVTaxBreakdown;
  }
  interface CountrySpecificBreakdownMap {
    LV: LVBreakdown;
  }
}

export function isLVInputs(inputs: CalculatorInputs): inputs is LVCalculatorInputs {
  return inputs.country === "LV";
}
