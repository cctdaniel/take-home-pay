import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface BEContributionInputs {
  pensionSavings: number;
  childcareExpenses: number;
  charitableDonations: number;
}

export type BEExpatRegimeType =
  | "none"
  | "inboundTaxpayer"
  | "inboundResearcher";

export interface BECalculatorInputs extends BaseCalculatorInputs {
  country: "BE";
  taxableBenefitsInKind: number;
  numberOfDependentChildren: number;
  numberOfChildrenUnderThreeNoChildcare: number;
  childcareDays: number;
  isSingleParentWithChildren: boolean;
  expatRegimeType: BEExpatRegimeType;
  expatRecurringAllowance: number;
  contributions: BEContributionInputs;
}

export interface BETaxBreakdown extends BaseTaxBreakdown {
  type: "BE";
  incomeTax: number;
  employeeSocialContribution: number;
  additionalIncomeTax: number;
}

export interface BEBreakdown {
  type: "BE";
  grossIncome: number;
  grossCashCompensation: number;
  taxableBenefitsInKind: number;
  taxableEmploymentIncome: number;
  taxableIncome: number;
  standardDeduction: number;
  personalTaxAllowance: number;
  personalTaxAllowanceCredit: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
  expatRegimeType: BEExpatRegimeType;
  expatRecurringAllowance: number;
  expatAllowanceLimit: number;
  expatSocialSecurityExemptAllowance: number;
  expatTaxpayerMinimumSalary: number;
  expatTaxpayerMinimumMet: boolean;
  pensionSavingsContribution: number;
  pensionSavingsTaxCredit: number;
  childcareDays: number;
  childcareExpenseLimit: number;
  childcareExpenses: number;
  childcareTaxReduction: number;
  charitableDonationLimit: number;
  charitableDonations: number;
  charitableDonationTaxReduction: number;
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
    BE: true;
  }

  interface ContributionInputMap {
    BE: BEContributionInputs;
  }

  interface CalculatorInputMap {
    BE: BECalculatorInputs;
  }

  interface TaxBreakdownMap {
    BE: BETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BE: BEBreakdown;
  }
}

export function isBEInputs(
  inputs: CalculatorInputs,
): inputs is BECalculatorInputs {
  return inputs.country === "BE";
}

export function isBETaxBreakdown(taxes: TaxBreakdown): taxes is BETaxBreakdown {
  return "type" in taxes && taxes.type === "BE";
}

export function isBEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BEBreakdown {
  return breakdown.type === "BE";
}
