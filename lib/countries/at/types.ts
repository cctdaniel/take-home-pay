import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type ATContributionInputs = Record<never, never>;

export interface ATCalculatorInputs extends BaseCalculatorInputs {
  country: "AT";
  contributions: ATContributionInputs;
}

export interface ATTaxBreakdown extends BaseTaxBreakdown {
  type: "AT";
  incomeTax: number;
  employeeSocialContribution: number;
  additionalIncomeTax: number;
}

export interface ATBreakdown {
  type: "AT";
  grossIncome: number;
  taxableIncome: number;
  standardDeduction: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  additionalIncomeTax: {
    name: string;
    amount: number;
    rate: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    AT: true;
  }

  interface ContributionInputMap {
    AT: ATContributionInputs;
  }

  interface CalculatorInputMap {
    AT: ATCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AT: ATTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AT: ATBreakdown;
  }
}

export function isATInputs(inputs: CalculatorInputs): inputs is ATCalculatorInputs {
  return inputs.country === "AT";
}

export function isATTaxBreakdown(taxes: TaxBreakdown): taxes is ATTaxBreakdown {
  return "type" in taxes && taxes.type === "AT";
}

export function isATBreakdown(breakdown: CountrySpecificBreakdown): breakdown is ATBreakdown {
  return breakdown.type === "AT";
}
