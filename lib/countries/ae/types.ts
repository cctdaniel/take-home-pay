import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";
import type { UAEUnemploymentInsuranceCategory } from "./constants/tax-year-2026";

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
  unemploymentInsuranceCategory: UAEUnemploymentInsuranceCategory;
  iloeBasicSalaryMonthly: number;
  pensionContributionSalaryMonthly: number;
  contributions: AEContributionInputs;
}

export interface AETaxBreakdown extends BaseTaxBreakdown {
  type: "AE";
  incomeTax: number;
  pensionEmployee: number;
  unemploymentInsurance: number;
}

export interface AEBreakdown {
  type: "AE";
  grossIncome: number;
  employeeCategory: AEEmployeeCategory;
  employeeCategoryLabel: string;
  taxableIncome: number;
  incomeTaxRate: number;
  unemploymentInsurance: {
    category: UAEUnemploymentInsuranceCategory;
    label: string;
    basicSalaryMonthly: number;
    annualPremium: number;
    monthlyPremium: number;
    description: string;
  };
  pension: {
    employee: number;
    employer: number;
    governmentSupport: number;
    employeeRate: number;
    employerRate: number;
    statutoryEmployerRate: number;
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
