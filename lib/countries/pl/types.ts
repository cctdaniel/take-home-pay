import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface PLCalculatorInputs extends BaseCalculatorInputs {
  country: "PL";
  contributions: Record<string, never>;
}

export interface PLTaxBreakdown extends BaseTaxBreakdown {
  type: "PL";
  incomeTax: number;
  socialSecurityEmployee: number;
  healthInsuranceEmployee: number;
}

export interface PLBreakdown {
  type: "PL";
  grossIncome: number;
  taxableIncome: number;
  taxFreeAmount: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  socialSecurity: {
    employee: number;
    employeeRate: number;
  };
  healthInsurance: {
    employee: number;
    employeeRate: number;
  };
  totalEmployeeContributions: number;
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { PLN: true; }
  interface CountryCodeMap { PL: true; }
  interface ContributionInputMap { PL: Record<string, never>; }
  interface CalculatorInputMap { PL: PLCalculatorInputs; }
  interface TaxBreakdownMap { PL: PLTaxBreakdown; }
  interface CountrySpecificBreakdownMap { PL: PLBreakdown; }
}

export function isPLInputs(inputs: CalculatorInputs): inputs is PLCalculatorInputs { return inputs.country === "PL"; }
export function isPLTaxBreakdown(taxes: TaxBreakdown): taxes is PLTaxBreakdown { return "type" in taxes && taxes.type === "PL"; }
export function isPLBreakdown(breakdown: CountrySpecificBreakdown): breakdown is PLBreakdown { return breakdown.type === "PL"; }
