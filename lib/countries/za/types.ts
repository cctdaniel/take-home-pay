import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface ZACalculatorInputs extends BaseCalculatorInputs {
  country: "ZA";
  age: number;
  contributions: Record<string, never>;
}

export interface ZATaxBreakdown extends BaseTaxBreakdown {
  type: "ZA";
  incomeTax: number;
  uifEmployee: number;
}

export interface ZABreakdown {
  type: "ZA";
  grossIncome: number;
  taxableIncome: number;
  taxRebate: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  uif: { employee: number; employeeRate: number; maxAnnualEarnings: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { ZAR: true; }
  interface CountryCodeMap { ZA: true; }
  interface ContributionInputMap { ZA: Record<string, never>; }
  interface CalculatorInputMap { ZA: ZACalculatorInputs; }
  interface TaxBreakdownMap { ZA: ZATaxBreakdown; }
  interface CountrySpecificBreakdownMap { ZA: ZABreakdown; }
}

export function isZAInputs(inputs: CalculatorInputs): inputs is ZACalculatorInputs { return inputs.country === "ZA"; }
export function isZATaxBreakdown(taxes: TaxBreakdown): taxes is ZATaxBreakdown { return "type" in taxes && taxes.type === "ZA"; }
export function isZABreakdown(breakdown: CountrySpecificBreakdown): breakdown is ZABreakdown { return breakdown.type === "ZA"; }
