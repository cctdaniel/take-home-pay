import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type AEEmployeeCategory =
  | "foreign_expat"
  | "uae_national_new_private"
  | "uae_national_legacy_private"
  | "gcc_bahrain_private"
  | "gcc_oman_private"
  | "gcc_saudi_private"
  | "gcc_kuwait_private"
  | "gcc_qatar_private";

export type AEContributionInputs = Record<never, never>;

export interface AECalculatorInputs extends BaseCalculatorInputs {
  country: "AE";
  employeeCategory: AEEmployeeCategory;
  contributions: AEContributionInputs;
}

export interface AETaxBreakdown extends BaseTaxBreakdown {
  type: "AE";
  incomeTax: number;
  pensionEmployee: number;
}

export interface AEBreakdown {
  type: "AE";
  grossIncome: number;
  employeeCategory: AEEmployeeCategory;
  employeeCategoryLabel: string;
  taxableIncome: number;
  incomeTaxRate: number;
  pension: {
    employee: number;
    employer: number;
    governmentSupport: number;
    employeeRate: number;
    employerRate: number;
    governmentSupportRate: number;
    contributionSalaryAnnual: number;
    contributionSalaryMonthly: number;
    monthlyMinimum?: number;
    monthlyMaximum?: number;
    governmentSupportMonthlyThreshold?: number;
    salaryBaseDescription: string;
  };
  assumptions: string[];
  exclusions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    AED: true;
  }

  interface CountryCodeMap {
    AE: true;
  }

  interface ContributionInputMap {
    AE: AEContributionInputs;
  }

  interface CalculatorInputMap {
    AE: AECalculatorInputs;
  }

  interface TaxBreakdownMap {
    AE: AETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AE: AEBreakdown;
  }
}

export function isAEInputs(
  inputs: CalculatorInputs,
): inputs is AECalculatorInputs {
  return inputs.country === "AE";
}

export function isAETaxBreakdown(taxes: TaxBreakdown): taxes is AETaxBreakdown {
  return "type" in taxes && taxes.type === "AE";
}

export function isAEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is AEBreakdown {
  return breakdown.type === "AE";
}
