import type { BaseCalculatorInputs, BaseTaxBreakdown, CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown } from "../types";

export interface CHContributionInputs {
  pillar3a: number;
}

export interface CHCalculatorInputs extends BaseCalculatorInputs {
  country: "CH";
  contributions: CHContributionInputs;
}

export interface CHTaxBreakdown extends BaseTaxBreakdown {
  type: "CH";
  incomeTax: number;
  socialSecurityEmployee: number;
}

export interface CHBreakdown {
  type: "CH";
  grossIncome: number;
  taxableIncome: number;
  pillar3aDeduction: number;
  federalTax: number;
  socialSecurity: {
    employee: number;
    employeeRate: number;
    ahvIvEo: number;
    alv: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { CHF: true; }
  interface CountryCodeMap { CH: true; }
  interface ContributionInputMap { CH: CHContributionInputs; }
  interface CalculatorInputMap { CH: CHCalculatorInputs; }
  interface TaxBreakdownMap { CH: CHTaxBreakdown; }
  interface CountrySpecificBreakdownMap { CH: CHBreakdown;
  }
}

export function isCHInputs(inputs: CalculatorInputs): inputs is CHCalculatorInputs { return inputs.country === "CH"; }
export function isCHTaxBreakdown(taxes: TaxBreakdown): taxes is CHTaxBreakdown { return "type" in taxes && taxes.type === "CH"; }
export function isCHBreakdown(breakdown: CountrySpecificBreakdown): breakdown is CHBreakdown { return breakdown.type === "CH"; }
