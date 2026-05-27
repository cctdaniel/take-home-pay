import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type FRHouseholdStatus = "single" | "married_pacs" | "single_parent";
export type FRProfessionalExpenseMethod = "standard_10_percent" | "actual";
export type FRImpatriateRegime = "none" | "forfait30" | "actualPremium";

export interface FRContributionInputs {
  retirementSavings: number;
  actualProfessionalExpenses: number;
  charitableDonations: number;
}

export interface FRCalculatorInputs extends BaseCalculatorInputs {
  country: "FR";
  taxableBenefitsInKind: number;
  contributions: FRContributionInputs;
  householdStatus: FRHouseholdStatus;
  numberOfChildren: number;
  taxHouseholdParts: number;
  professionalExpenseMethod: FRProfessionalExpenseMethod;
  impatriateRegime: FRImpatriateRegime;
  impatriatePremiumAmount: number;
  frenchReferenceSalary: number;
}

export interface FRTaxBreakdown extends BaseTaxBreakdown {
  type: "FR";
  incomeTax: number;
  employeeSocialContribution: number;
  additionalIncomeTax: number;
}

export interface FRBreakdown {
  type: "FR";
  grossIncome: number;
  taxableBenefitsInKind: number;
  taxableGrossIncome: number;
  taxableEmploymentIncome: number;
  taxableIncome: number;
  standardDeduction: number;
  professionalExpenseMethod: FRProfessionalExpenseMethod;
  actualProfessionalExpenses: number;
  impatriateRegime: FRImpatriateRegime;
  impatriateSalaryExemption: number;
  impatriatePremiumLimit: number;
  impatriateForfaitPremium: number;
  impatriateActualPremium: number;
  frenchReferenceSalary: number;
  impatriateReferenceSalaryLimit: number;
  retirementSavingsDeduction: number;
  retirementSavingsLimit: number;
  disallowedRetirementSavings: number;
  charitableDonations: number;
  charitableDonationReduction: number;
  taxHouseholdParts: number;
  householdStatus: FRHouseholdStatus;
  numberOfChildren: number;
  baseHouseholdParts: number;
  familyQuotientBenefit: number;
  familyQuotientCap: number;
  familyQuotientCapApplied: boolean;
  incomeTaxBeforeQuotientCap: number;
  incomeTaxBeforeCredits: number;
  decote: number;
  lowTaxCollectionReduction: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  additionalIncomeTax: {
    name: string;
    amount: number;
    rate: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    FR: true;
  }

  interface ContributionInputMap {
    FR: FRContributionInputs;
  }

  interface CalculatorInputMap {
    FR: FRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    FR: FRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    FR: FRBreakdown;
  }
}

export function isFRInputs(inputs: CalculatorInputs): inputs is FRCalculatorInputs {
  return inputs.country === "FR";
}

export function isFRTaxBreakdown(taxes: TaxBreakdown): taxes is FRTaxBreakdown {
  return "type" in taxes && taxes.type === "FR";
}

export function isFRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is FRBreakdown {
  return breakdown.type === "FR";
}
