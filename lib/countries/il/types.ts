import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface ILCalculatorInputs extends BaseCalculatorInputs {
  country: "IL";
  contributions: Record<string, never>;
}

export interface ILTaxBreakdown extends BaseTaxBreakdown {
  type: "IL";
  incomeTax: number;
  socialSecurityEmployee: number;
  healthInsuranceEmployee: number;
}

export interface ILBreakdown {
  type: "IL";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: number;
  bituachLeumi: { employee: number; employeeRate: number; maxMonthlyBase: number };
  healthInsurance: { employee: number; employeeRate: number; maxMonthlyBase: number };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { ILS: true; }
  interface CountryCodeMap { IL: true; }
  interface ContributionInputMap { IL: Record<string, never>; }
  interface CalculatorInputMap { IL: ILCalculatorInputs; }
  interface TaxBreakdownMap { IL: ILTaxBreakdown; }
  interface CountrySpecificBreakdownMap { IL: ILBreakdown; }
}

export function isILInputs(inputs: CalculatorInputs): inputs is ILCalculatorInputs { return inputs.country === "IL"; }
export function isILTaxBreakdown(taxes: TaxBreakdown): taxes is ILTaxBreakdown { return "type" in taxes && taxes.type === "IL"; }
export function isILBreakdown(breakdown: CountrySpecificBreakdown): breakdown is ILBreakdown { return breakdown.type === "IL"; }
