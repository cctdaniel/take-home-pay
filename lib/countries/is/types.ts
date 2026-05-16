import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type ISContributionInputs = Record<never, never>;

export interface ISCalculatorInputs extends BaseCalculatorInputs {
  country: "IS";
  contributions: ISContributionInputs;
}

export interface ISTaxBreakdown extends BaseTaxBreakdown {
  type: "IS";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface ISBreakdown {
  type: "IS";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  standardDeduction: number;
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    ISK: true;
  }

  interface CountryCodeMap {
    IS: true;
  }

  interface ContributionInputMap {
    IS: ISContributionInputs;
  }

  interface CalculatorInputMap {
    IS: ISCalculatorInputs;
  }

  interface TaxBreakdownMap {
    IS: ISTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    IS: ISBreakdown;
  }
}

export function isISInputs(inputs: CalculatorInputs): inputs is ISCalculatorInputs {
  return inputs.country === "IS";
}

export function isISTaxBreakdown(taxes: TaxBreakdown): taxes is ISTaxBreakdown {
  return "type" in taxes && taxes.type === "IS";
}

export function isISBreakdown(breakdown: CountrySpecificBreakdown): breakdown is ISBreakdown {
  return breakdown.type === "IS";
}
