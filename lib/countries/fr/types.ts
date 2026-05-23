import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface FRContributionInputs {
  retirementSavings: number;
}

export interface FRCalculatorInputs extends BaseCalculatorInputs {
  country: "FR";
  contributions: FRContributionInputs;
  taxHouseholdParts: number;
}

export interface FRTaxBreakdown extends BaseTaxBreakdown {
  type: "FR";
  incomeTax: number;
  employeeSocialContribution: number;
  additionalIncomeTax: number;
}

export interface FRBreakdown {
  type: "FR";
  grossIncome: number;
  taxableIncome: number;
  standardDeduction: number;
  retirementSavingsDeduction: number;
  disallowedRetirementSavings: number;
  taxHouseholdParts: number;
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
    FR: true;
  }

  interface ContributionInputMap {
    FR: FRContributionInputs;
  }

  interface CalculatorInputMap {
    FR: FRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    FR: FRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    FR: FRBreakdown;
  }
}

export function isFRInputs(inputs: CalculatorInputs): inputs is FRCalculatorInputs {
  return inputs.country === "FR";
}

export function isFRTaxBreakdown(taxes: TaxBreakdown): taxes is FRTaxBreakdown {
  return "type" in taxes && taxes.type === "FR";
}

export function isFRBreakdown(breakdown: CountrySpecificBreakdown): breakdown is FRBreakdown {
  return breakdown.type === "FR";
}
