import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type SANationalityType = "saudi_national" | "expatriate";
export type SAContributionInputs = Record<string, never>;

export interface SACalculatorInputs extends BaseCalculatorInputs {
  country: "SA";
  nationality: SANationalityType;
  contributions: SAContributionInputs;
}

export interface SATaxBreakdown extends BaseTaxBreakdown {
  type: "SA";
  incomeTax: number;
  gosiEmployee: number;
}

export interface SABreakdown {
  type: "SA";
  grossIncome: number;
  nationality: SANationalityType;
  contributionSalaryAnnual: number;
  contributionSalaryMonthly: number;
  incomeTaxRate: number;
  gosi: {
    employeeRate: number;
    employee: number;
    monthlyCap: number;
    salaryShare: number;
  };
  voluntaryContributions: {
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    SA: true;
  }

  interface CurrencyCodeMap {
    SAR: true;
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

  interface ContributionInputMap {
    SA: SAContributionInputs;
  }
}

export function isSAInputs(
  inputs: CalculatorInputs,
): inputs is SACalculatorInputs {
  return inputs.country === "SA";
}

export function isSATaxBreakdown(taxes: TaxBreakdown): taxes is SATaxBreakdown {
  return "type" in taxes && taxes.type === "SA";
}

export function isSABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SABreakdown {
  return breakdown.type === "SA";
}
