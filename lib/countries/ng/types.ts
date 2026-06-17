import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
} from "../types";

export type NGContributionInputs = Record<never, never>;

export interface NGCalculatorInputs extends BaseCalculatorInputs {
  country: "NG";
  contributions: NGContributionInputs;
}

export interface NGTaxBreakdown extends BaseTaxBreakdown {
  type: "NG";
  incomeTax: number;
  pension: number;
}

export interface NGBreakdown {
  type: "NG";
  grossIncome: number;
  pension: number;
  chargeableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    NG: true;
  }

  interface CurrencyCodeMap {
    NGN: true;
  }

  interface ContributionInputMap {
    NG: NGContributionInputs;
  }

  interface CalculatorInputMap {
    NG: NGCalculatorInputs;
  }

  interface TaxBreakdownMap {
    NG: NGTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    NG: NGBreakdown;
  }
}

export function isNGInputs(inputs: CalculatorInputs): inputs is NGCalculatorInputs {
  return inputs.country === "NG";
}
