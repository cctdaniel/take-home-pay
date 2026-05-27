import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type DKTaxRegime = "ordinary" | "researcherScheme";
export type DKStatePensionProximity =
  | "more_than_15_years"
  | "within_15_years"
  | "one_or_two_years";

export interface DKContributionInputs {
  privateRatePension: number;
  tradeUnionFees: number;
  unemploymentInsuranceFees: number;
  householdServices: number;
  otherWorkExpenses: number;
}

export interface DKCalculatorInputs extends BaseCalculatorInputs {
  country: "DK";
  taxableBenefitsInKind: number;
  taxRegime: DKTaxRegime;
  statePensionProximity: DKStatePensionProximity;
  singleParentAllowanceEligible: boolean;
  roundTripCommutingKm: number;
  commutingWorkdays: number;
  contributions: DKContributionInputs;
}

export interface DKTaxBreakdown extends BaseTaxBreakdown {
  type: "DK";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface DKBreakdown {
  type: "DK";
  grossIncome: number;
  taxableBenefitsInKind: number;
  taxableGrossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  taxRegime: DKTaxRegime;
  specialRegime?: {
    name: string;
    rate: number;
    incomeTax: number;
    employeeSocialContribution: number;
  };
  personalAllowance: number;
  automaticAllowances: {
    employmentAllowance: number;
    jobAllowance: number;
    singleParentEmploymentAllowance: number;
    seniorEmploymentAllowance: number;
  };
  voluntaryDeductions: {
    privateRatePension: number;
    extraPensionDeduction: number;
    tradeUnionFees: number;
    unemploymentInsuranceFees: number;
    commutingDeduction: number;
    householdServices: number;
    otherWorkExpensesDeduction: number;
  };
  stateTaxes?: {
    bottomTax: number;
    middleTax: number;
    topTax: number;
    topTopTax: number;
    municipalTax: number;
  };
  pensionProximity: DKStatePensionProximity;
  singleParentAllowanceEligible: boolean;
  roundTripCommutingKm: number;
  commutingWorkdays: number;
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    DKK: true;
  }

  interface CountryCodeMap {
    DK: true;
  }

  interface ContributionInputMap {
    DK: DKContributionInputs;
  }

  interface CalculatorInputMap {
    DK: DKCalculatorInputs;
  }

  interface TaxBreakdownMap {
    DK: DKTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    DK: DKBreakdown;
  }
}

export function isDKInputs(inputs: CalculatorInputs): inputs is DKCalculatorInputs {
  return inputs.country === "DK";
}

export function isDKTaxBreakdown(taxes: TaxBreakdown): taxes is DKTaxBreakdown {
  return "type" in taxes && taxes.type === "DK";
}

export function isDKBreakdown(breakdown: CountrySpecificBreakdown): breakdown is DKBreakdown {
  return breakdown.type === "DK";
}
