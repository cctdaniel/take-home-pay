import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface ISContributionInputs {
  privatePensionContribution: number;
  charitableDonations: number;
}

export interface ISCalculatorInputs extends BaseCalculatorInputs {
  country: "IS";
  foreignExpertRelief: boolean;
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
  foreignExpertRelief: {
    applies: boolean;
    exemptAmount: number;
    rate: number;
    years: number;
  };
  voluntaryContributions: Array<{
    key: keyof ISContributionInputs;
    name: string;
    amount: number;
    limit: number;
    preTax: boolean;
    cashFlowTreatment: "deductFromNet" | "taxOnly";
  }>;
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
