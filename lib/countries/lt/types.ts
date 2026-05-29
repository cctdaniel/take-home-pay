import type {
  BaseCalculatorInputs,
  CalculatorInputs,
} from "../types";

export interface LTContributionInputs {
  /** Qualifying III-pillar pension / life insurance — reduces GPM base. */
  pensionDeduction: number;
}

export interface LTCalculatorInputs extends BaseCalculatorInputs {
  country: "LT";
  contributions: LTContributionInputs;
}

export interface LTTaxBreakdown extends BaseTaxBreakdown {
  type: "LT";
  incomeTax: number;
  vsdEmployee: number;
}

export interface LTBreakdown {
  type: "LT";
  grossIncome: number;
  vsd: {
    rate: number;
    base: number;
    employee: number;
    annualCap: number;
  };
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    pensionDeduction: number;
    pensionDeductionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    LT: true;
  }
  interface ContributionInputMap {
    LT: LTContributionInputs;
  }
  interface CalculatorInputMap {
    LT: LTCalculatorInputs;
  }
  interface TaxBreakdownMap {
    LT: LTTaxBreakdown;
  }
  interface CountrySpecificBreakdownMap {
    LT: LTBreakdown;
  }
}

export function isLTInputs(inputs: CalculatorInputs): inputs is LTCalculatorInputs {
  return inputs.country === "LT";
}
