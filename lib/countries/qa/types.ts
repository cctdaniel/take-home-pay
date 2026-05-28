import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type QANationalityType = "qatari_national" | "expatriate";
export type QAContributionInputs = Record<string, never>;

export interface QACalculatorInputs extends BaseCalculatorInputs {
  country: "QA";
  nationality: QANationalityType;
  contributions: QAContributionInputs;
}

export interface QATaxBreakdown extends BaseTaxBreakdown {
  type: "QA";
  incomeTax: number;
  socialInsuranceEmployee: number;
}

export interface QABreakdown {
  type: "QA";
  grossIncome: number;
  nationality: QANationalityType;
  contributionSalaryAnnual: number;
  contributionSalaryMonthly: number;
  incomeTaxRate: number;
  socialInsurance: {
    employeeRate: number;
    employee: number;
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
    QA: true;
  }

  interface CurrencyCodeMap {
    QAR: true;
  }

  interface CalculatorInputMap {
    QA: QACalculatorInputs;
  }

  interface TaxBreakdownMap {
    QA: QATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    QA: QABreakdown;
  }

  interface ContributionInputMap {
    QA: QAContributionInputs;
  }
}

export function isQAInputs(
  inputs: CalculatorInputs,
): inputs is QACalculatorInputs {
  return inputs.country === "QA";
}

export function isQATaxBreakdown(taxes: TaxBreakdown): taxes is QATaxBreakdown {
  return "type" in taxes && taxes.type === "QA";
}

export function isQABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is QABreakdown {
  return breakdown.type === "QA";
}
