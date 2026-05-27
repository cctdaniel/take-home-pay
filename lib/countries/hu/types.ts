import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface HUCalculatorInputs extends BaseCalculatorInputs {
  country: "HU";
  contributions: Record<string, never>;
}

export interface HUTaxBreakdown extends BaseTaxBreakdown {
  type: "HU";
  incomeTax: number;
  socialContributionEmployee: number;
}

export interface HUBreakdown {
  type: "HU";
  grossIncome: number;
  taxableIncome: number;
  incomeTaxRate: number;
  incomeTax: number;
  socialContributions: {
    employee: number;
    employeeRate: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { HUF: true; }
  interface CountryCodeMap { HU: true; }
  interface ContributionInputMap { HU: Record<string, never>; }
  interface CalculatorInputMap { HU: HUCalculatorInputs; }
  interface TaxBreakdownMap { HU: HUTaxBreakdown; }
  interface CountrySpecificBreakdownMap { HU: HUBreakdown; }
}

export function isHUInputs(inputs: CalculatorInputs): inputs is HUCalculatorInputs { return inputs.country === "HU"; }
export function isHUTaxBreakdown(taxes: TaxBreakdown): taxes is HUTaxBreakdown { return "type" in taxes && taxes.type === "HU"; }
export function isHUBreakdown(breakdown: CountrySpecificBreakdown): breakdown is HUBreakdown { return breakdown.type === "HU"; }
