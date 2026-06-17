import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type BHNationalityType = "bahraini_national" | "expatriate";
export type BHContributionInputs = Record<never, never>;

export interface BHCalculatorInputs extends BaseCalculatorInputs {
  country: "BH";
  nationality: BHNationalityType;
  contributions: BHContributionInputs;
}

export interface BHTaxBreakdown extends BaseTaxBreakdown {
  type: "BH";
  incomeTax: number;
  socialInsuranceEmployee: number;
}

export interface BHBreakdown {
  type: "BH";
  grossIncome: number;
  nationality: BHNationalityType;
  contributionBase: number;
  incomeTaxRate: number;
  socialInsurance: {
    employeeRate: number;
    employee: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    BH: true;
  }

  interface CurrencyCodeMap {
    BHD: true;
  }

  interface ContributionInputMap {
    BH: BHContributionInputs;
  }

  interface CalculatorInputMap {
    BH: BHCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BH: BHTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BH: BHBreakdown;
  }
}

export function isBHInputs(inputs: CalculatorInputs): inputs is BHCalculatorInputs {
  return inputs.country === "BH";
}

export function isBHTaxBreakdown(taxes: TaxBreakdown): taxes is BHTaxBreakdown {
  return "type" in taxes && taxes.type === "BH";
}

export function isBHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BHBreakdown {
  return breakdown.type === "BH";
}
