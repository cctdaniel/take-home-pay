import type {
  BaseCalculatorInputs, BaseTaxBreakdown,
  CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown,
} from "../types";

export interface BGCalculatorInputs extends BaseCalculatorInputs {
  country: "BG";
  contributions: Record<string, never>;
}

export interface BGTaxBreakdown extends BaseTaxBreakdown {
  type: "BG";
  incomeTax: number;
  socialSecurityEmployee: number;
}

export interface BGBreakdown {
  type: "BG";
  grossIncome: number;
  taxableIncome: number;
  incomeTaxRate: number;
  incomeTax: number;
  socialSecurity: {
    employee: number;
    employeeRate: number;
    employer: number;
    employerRate: number;
    maxMonthlyBase: number;
    maxAnnualBase: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { BGN: true; }
  interface CountryCodeMap { BG: true; }
  interface ContributionInputMap { BG: Record<string, never>; }
  interface CalculatorInputMap { BG: BGCalculatorInputs; }
  interface TaxBreakdownMap { BG: BGTaxBreakdown; }
  interface CountrySpecificBreakdownMap { BG: BGBreakdown; }
}

export function isBGInputs(inputs: CalculatorInputs): inputs is BGCalculatorInputs {
  return inputs.country === "BG";
}
export function isBGTaxBreakdown(taxes: TaxBreakdown): taxes is BGTaxBreakdown {
  return "type" in taxes && taxes.type === "BG";
}
export function isBGBreakdown(breakdown: CountrySpecificBreakdown): breakdown is BGBreakdown {
  return breakdown.type === "BG";
}
