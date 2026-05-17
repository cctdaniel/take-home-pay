import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";

export type CAContributionInputs = Record<never, never>;

export interface CACalculatorInputs extends BaseCalculatorInputs {
  country: "CA";
  province: "ON";
  contributions: CAContributionInputs;
}

export interface CATaxBreakdown extends BaseTaxBreakdown {
  type: "CA";
  incomeTax: number;
  provincialIncomeTax: number;
  cpp: number;
  cpp2: number;
  ei: number;
}

export interface CABreakdown {
  type: "CA";
  grossIncome: number;
  taxableIncome: number;
  province: "ON";
  provinceName: string;
  federalBracketTaxes: Array<TaxBracket & { tax: number }>;
  provincialBracketTaxes: Array<TaxBracket & { tax: number }>;
  cpp: {
    pensionableEarnings: number;
    employeeRate: number;
    maximumEmployeeContribution: number;
    additionalPensionableEarnings: number;
    secondAdditionalEmployeeRate: number;
    maximumSecondAdditionalEmployeeContribution: number;
  };
  ei: {
    insurableEarnings: number;
    employeeRate: number;
    maximumEmployeePremium: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    CAD: true;
  }

  interface CountryCodeMap {
    CA: true;
  }

  interface ContributionInputMap {
    CA: CAContributionInputs;
  }

  interface CalculatorInputMap {
    CA: CACalculatorInputs;
  }

  interface TaxBreakdownMap {
    CA: CATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CA: CABreakdown;
  }
}

export function isCAInputs(inputs: CalculatorInputs): inputs is CACalculatorInputs {
  return inputs.country === "CA";
}

export function isCATaxBreakdown(taxes: TaxBreakdown): taxes is CATaxBreakdown {
  return "type" in taxes && taxes.type === "CA";
}

export function isCABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CABreakdown {
  return breakdown.type === "CA";
}
