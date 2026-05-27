import type {
  BaseCalculatorInputs, BaseTaxBreakdown,
  CalculatorInputs, CountrySpecificBreakdown, TaxBreakdown,
} from "../types";

export interface ROCalculatorInputs extends BaseCalculatorInputs {
  country: "RO";
  hasHigherEducation: boolean;
  contributions: Record<string, never>;
}

export interface ROTaxBreakdown extends BaseTaxBreakdown {
  type: "RO";
  incomeTax: number;
  socialSecurityEmployee: number;
  healthInsuranceEmployee: number;
}

export interface ROBreakdown {
  type: "RO";
  grossIncome: number;
  taxableIncome: number;
  incomeTaxRate: number;
  incomeTax: number;
  socialSecurity: {
    employee: number;
    employeeRate: number;
    employerRate: number;
  };
  healthInsurance: {
    employee: number;
    employeeRate: number;
  };
  workInsurance: {
    employeeRate: number;
    employee: number;
  };
  totalEmployeeContributions: number;
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap { RON: true; }
  interface CountryCodeMap { RO: true; }
  interface ContributionInputMap { RO: Record<string, never>; }
  interface CalculatorInputMap { RO: ROCalculatorInputs; }
  interface TaxBreakdownMap { RO: ROTaxBreakdown; }
  interface CountrySpecificBreakdownMap { RO: ROBreakdown; }
}

export function isROInputs(inputs: CalculatorInputs): inputs is ROCalculatorInputs { return inputs.country === "RO"; }
export function isROTaxBreakdown(taxes: TaxBreakdown): taxes is ROTaxBreakdown { return "type" in taxes && taxes.type === "RO"; }
export function isROBreakdown(breakdown: CountrySpecificBreakdown): breakdown is ROBreakdown { return breakdown.type === "RO"; }
