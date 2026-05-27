import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface NOContributionInputs {
  ipsContribution: number;
  tradeUnionFees: number;
  childcareExpenses: number;
  debtInterestPaid: number;
}

export type NOTaxScheme = "ordinary" | "paye";

export type NOPayeNationalInsurance = "included" | "exempt";
export type NOChildcareDeductionMode = "ordinary" | "specialNeeds";

export interface NOCalculatorInputs extends BaseCalculatorInputs {
  country: "NO";
  taxScheme: NOTaxScheme;
  payeNationalInsurance: NOPayeNationalInsurance;
  childcareDeductionMode: NOChildcareDeductionMode;
  childcareChildren: number;
  roundTripCommutingKm: number;
  commutingWorkdays: number;
  contributions: NOContributionInputs;
}

export interface NOTaxBreakdown extends BaseTaxBreakdown {
  type: "NO";
  incomeTax: number;
  employeeSocialContribution: number;
}

export interface NOBreakdown {
  type: "NO";
  grossIncome: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  taxScheme: NOTaxScheme;
  paye: {
    selected: boolean;
    applied: boolean;
    nationalInsurance: NOPayeNationalInsurance;
    threshold: number;
    totalRate: number;
    incomeTaxRate: number;
    nationalInsuranceRate: number;
  };
  standardDeduction: number;
  assumptions: string[];
  sourceUrls: string[];
  voluntaryContributions: {
    ipsContribution: number;
    ipsDeductionApplied: number;
    ipsDeductionLimit: number;
    tradeUnionFees: number;
    childcareExpenses: number;
    childcareDeductionApplied: number;
    childcareDeductionLimit: number;
    debtInterestPaid: number;
    commutingDeduction: number;
  };
}

declare module "../types" {
  interface CurrencyCodeMap {
    NOK: true;
  }

  interface CountryCodeMap {
    NO: true;
  }

  interface ContributionInputMap {
    NO: NOContributionInputs;
  }

  interface CalculatorInputMap {
    NO: NOCalculatorInputs;
  }

  interface TaxBreakdownMap {
    NO: NOTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    NO: NOBreakdown;
  }
}

export function isNOInputs(inputs: CalculatorInputs): inputs is NOCalculatorInputs {
  return inputs.country === "NO";
}

export function isNOTaxBreakdown(taxes: TaxBreakdown): taxes is NOTaxBreakdown {
  return "type" in taxes && taxes.type === "NO";
}

export function isNOBreakdown(breakdown: CountrySpecificBreakdown): breakdown is NOBreakdown {
  return breakdown.type === "NO";
}
