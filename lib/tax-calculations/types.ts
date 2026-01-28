// ============================================================================
// TAX CALCULATIONS TYPES
// Re-exports from the new countries module for backwards compatibility
// ============================================================================

// Re-export types from the new countries module
export type {
  PayFrequency,
  TaxBracket,
  USFilingStatus,
  USContributionInputs,
  USTaxBreakdown,
  CountryCode,
  CurrencyCode,
} from "../countries/types";

// Re-export HSACoverageType
export type { HSACoverageType } from "../countries/us/constants/contribution-limits";

// Legacy type aliases for backwards compatibility
import type {
  USFilingStatus,
  USContributionInputs,
  USCalculatorInputs,
  USTaxBreakdown,
  PayFrequency,
} from "../countries/types";

// Backwards compatible interfaces (map to US-specific types)
export type FilingStatus = USFilingStatus;

export interface ContributionInputs {
  traditional401k: number;
  rothIRA: number;
  hsa: number;
  hsaCoverageType: "self" | "family";
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
