import type { FilingStatus } from "../constants/tax-brackets-2025";
import type { HSACoverageType } from "../constants/contribution-limits";

export type PayFrequency = "annual" | "monthly" | "biweekly" | "weekly";

export interface ContributionInputs {
  traditional401k: number;
  rothIRA: number;
  hsa: number;
  hsaCoverageType: HSACoverageType;
}

export interface CalculatorInputs {
  grossSalary: number;
  state: string;
  filingStatus: FilingStatus;
  payFrequency: PayFrequency;
  contributions: ContributionInputs;
}

export interface TaxBreakdown {
  federalIncomeTax: number;
  stateIncomeTax: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  stateDisabilityInsurance: number;
}

export interface CalculationResult {
  grossSalary: number;
  taxableIncomeForFederal: number;
  taxableIncomeForState: number;
  taxes: TaxBreakdown;
  totalTax: number;
  totalContributions: number;
  netSalary: number;
  effectiveTaxRate: number;
  perPeriod: {
    gross: number;
    net: number;
    frequency: PayFrequency;
  };
}

export interface StateCalculator {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => number;
  calculateSDI: (grossIncome: number) => number;
  getStateName: () => string;
}
