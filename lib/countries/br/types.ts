import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface BRCalculatorInputs extends BaseCalculatorInputs {
  country: "BR";
  contributions: Record<string, never>;
}

export interface BRTaxBreakdown extends BaseTaxBreakdown {
  type: "BR";
  incomeTax: number;
  inssEmployee: number;
}

export interface BRBreakdown {
  type: "BR";
  grossIncome: number;
  taxableIncome: number;
  deductions: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  inss: {
    employee: number;
    employeeRate: number;
    maxMonthlyBase: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { BRL: true; }
  interface CountryCodeMap { BR: true; }
  interface ContributionInputMap { BR: Record<string, never>; }
  interface CalculatorInputMap { BR: BRCalculatorInputs; }
  interface TaxBreakdownMap { BR: BRTaxBreakdown; }
  interface CountrySpecificBreakdownMap { BR: BRBreakdown; }
}

export function isBRInputs(inputs: CalculatorInputs): inputs is BRCalculatorInputs { return inputs.country === "BR"; }
export function isBRTaxBreakdown(taxes: TaxBreakdown): taxes is BRTaxBreakdown { return "type" in taxes && taxes.type === "BR"; }
export function isBRBreakdown(breakdown: CountrySpecificBreakdown): breakdown is BRBreakdown { return breakdown.type === "BR"; }
