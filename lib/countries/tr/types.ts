import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface TRCalculatorInputs extends BaseCalculatorInputs {
  country: "TR";
  contributions: Record<string, never>;
}

export interface TRTaxBreakdown extends BaseTaxBreakdown {
  type: "TR";
  incomeTax: number;
  socialSecurityEmployee: number;
  unemploymentInsuranceEmployee: number;
}

export interface TRBreakdown {
  type: "TR";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  socialSecurity: { employee: number; employeeRate: number };
  unemploymentInsurance: { employee: number; employeeRate: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { TRY: true; }
  interface CountryCodeMap { TR: true; }
  interface ContributionInputMap { TR: Record<string, never>; }
  interface CalculatorInputMap { TR: TRCalculatorInputs; }
  interface TaxBreakdownMap { TR: TRTaxBreakdown; }
  interface CountrySpecificBreakdownMap { TR: TRBreakdown; }
}

export function isTRInputs(inputs: CalculatorInputs): inputs is TRCalculatorInputs { return inputs.country === "TR"; }
export function isTRTaxBreakdown(taxes: TaxBreakdown): taxes is TRTaxBreakdown { return "type" in taxes && taxes.type === "TR"; }
export function isTRBreakdown(breakdown: CountrySpecificBreakdown): breakdown is TRBreakdown { return breakdown.type === "TR"; }
