import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface FIContributionInputs {
  commutingExpenses: number;
  unemploymentFundFees: number;
  otherIncomeProductionExpenses: number;
  householdWorkExpenses: number;
  voluntaryPensionInsurance: number;
}
export type FITaxRegime = "ordinary" | "keyEmployee";

export interface FICalculatorInputs extends BaseCalculatorInputs {
  country: "FI";
  taxRegime: FITaxRegime;
  age: number;
  taxableFringeBenefits: number;
  contributions: FIContributionInputs;
}

export interface FITaxBreakdown extends BaseTaxBreakdown {
  type: "FI";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface FIBreakdown {
  type: "FI";
  grossIncome: number;
  cashGrossIncome: number;
  taxableFringeBenefits: number;
  taxableEmploymentIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
    pensionContribution: number;
    pensionRate: number;
    unemploymentContribution: number;
    unemploymentRate: number;
    healthCareContribution: number;
    healthCareRate: number;
    dailyAllowanceContribution: number;
    dailyAllowanceRate: number;
  };
  taxRegime: FITaxRegime;
  age: number;
  specialRegime?: {
    name: string;
    rate: number;
    incomeTax: number;
  };
  standardDeduction: number;
  voluntaryDeductions: {
    commutingExpenses: number;
    commutingDeduction: number;
    unemploymentFundFees: number;
    otherIncomeProductionExpenses: number;
    otherIncomeProductionDeduction: number;
    householdWorkExpenses: number;
    householdExpenseCredit: number;
    voluntaryPensionInsurance: number;
    voluntaryPensionCredit: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    FI: true;
  }

  interface ContributionInputMap {
    FI: FIContributionInputs;
  }

  interface CalculatorInputMap {
    FI: FICalculatorInputs;
  }

  interface TaxBreakdownMap {
    FI: FITaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    FI: FIBreakdown;
  }
}

export function isFIInputs(inputs: CalculatorInputs): inputs is FICalculatorInputs {
  return inputs.country === "FI";
}

export function isFITaxBreakdown(taxes: TaxBreakdown): taxes is FITaxBreakdown {
  return "type" in taxes && taxes.type === "FI";
}

export function isFIBreakdown(breakdown: CountrySpecificBreakdown): breakdown is FIBreakdown {
  return breakdown.type === "FI";
}
