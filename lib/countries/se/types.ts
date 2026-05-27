import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface SEContributionInputs {
  privatePensionSavings: number;
  commutingExpenses: number;
  otherWorkExpenses: number;
  rotRutTaxReduction: number;
  greenTechnologyTaxReduction: number;
}
export type SETaxRegime = "ordinary" | "expertRelief";

export interface SECalculatorInputs extends BaseCalculatorInputs {
  country: "SE";
  taxRegime: SETaxRegime;
  municipalTaxRate: number;
  noOccupationalPension: boolean;
  contributions: SEContributionInputs;
}

export interface SETaxBreakdown extends BaseTaxBreakdown {
  type: "SE";
  incomeTax: number;
  employeeSocialContribution: number;
  employeeSocialTaxCredit: number;
}

export interface SEBreakdown {
  type: "SE";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  employeeSocialTaxCredit: number;
  taxRegime: SETaxRegime;
  expertRelief?: {
    exemptIncome: number;
    taxableSalaryBase: number;
    exemptRate: number;
  };
  standardDeduction: number;
  municipalTaxRate: number;
  noOccupationalPension: boolean;
  voluntaryDeductions: {
    privatePensionSavings: number;
    commutingExpenses: number;
    commutingDeduction: number;
    otherWorkExpenses: number;
    otherWorkExpenseDeduction: number;
    rotRutTaxReduction: number;
    greenTechnologyTaxReduction: number;
    appliedTaxReductions: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    SEK: true;
  }

  interface CountryCodeMap {
    SE: true;
  }

  interface ContributionInputMap {
    SE: SEContributionInputs;
  }

  interface CalculatorInputMap {
    SE: SECalculatorInputs;
  }

  interface TaxBreakdownMap {
    SE: SETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SE: SEBreakdown;
  }
}

export function isSEInputs(inputs: CalculatorInputs): inputs is SECalculatorInputs {
  return inputs.country === "SE";
}

export function isSETaxBreakdown(taxes: TaxBreakdown): taxes is SETaxBreakdown {
  return "type" in taxes && taxes.type === "SE";
}

export function isSEBreakdown(breakdown: CountrySpecificBreakdown): breakdown is SEBreakdown {
  return breakdown.type === "SE";
}
