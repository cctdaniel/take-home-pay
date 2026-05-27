import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type SAEmploymentType = "saudi_national" | "expat";

export interface SACalculatorInputs extends BaseCalculatorInputs {
  country: "SA";
  employmentType: SAEmploymentType;
  contributions: Record<string, never>;
}

export interface SATaxBreakdown extends BaseTaxBreakdown {
  type: "SA";
  incomeTax: number;
  socialInsuranceEmployee: number;
}

export interface SABreakdown {
  type: "SA";
  grossIncome: number;
  employmentType: SAEmploymentType;
  isSaudiNational: boolean;
  taxableIncome: number;
  incomeTaxRate: number;
  socialInsurance: {
    employee: number;
    employeeRate: number;
    employer: number;
    employerRate: number;
    maxContributionSalary: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    SAR: true;
  }
  interface CountryCodeMap {
    SA: true;
  }
  interface ContributionInputMap {
    SA: Record<string, never>;
  }
  interface CalculatorInputMap {
    SA: SACalculatorInputs;
  }
  interface TaxBreakdownMap {
    SA: SATaxBreakdown;
  }
  interface CountrySpecificBreakdownMap {
    SA: SABreakdown;
  }
}

export function isSAInputs(inputs: CalculatorInputs): inputs is SACalculatorInputs {
  return inputs.country === "SA";
}

export function isSATaxBreakdown(taxes: TaxBreakdown): taxes is SATaxBreakdown {
  return "type" in taxes && taxes.type === "SA";
}

export function isSABreakdown(breakdown: CountrySpecificBreakdown): breakdown is SABreakdown {
  return breakdown.type === "SA";
}
