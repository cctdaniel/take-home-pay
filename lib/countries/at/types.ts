import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";
import type {
  ATCommuterAllowanceType,
  ATCommuterDistanceBand,
  ATCommuterWorkdayLevel,
} from "./constants/tax-year-2026";

export type ATFamilyBonusChildren = number;
export type ATFamilyBonusShare = "full" | "half";
export type ATFamilyCreditStatus = "none" | "singleEarner" | "singleParent";
export type ATSpecialPaymentMode =
  | "includedInGross"
  | "additionalToGross"
  | "customIncludedInGross"
  | "customAdditionalToGross"
  | "none";

export interface ATContributionInputs {
  churchContributions: number;
  charitableDonations: number;
  voluntaryPensionInsurance: number;
}

export interface ATCalculatorInputs extends BaseCalculatorInputs {
  country: "AT";
  familyBonusChildren: ATFamilyBonusChildren;
  familyBonusChildrenUnder18: number;
  familyBonusChildrenOver18: number;
  familyBonusShare: ATFamilyBonusShare;
  familyCreditStatus: ATFamilyCreditStatus;
  commuterAllowanceType: ATCommuterAllowanceType;
  commuterDistanceBand: ATCommuterDistanceBand;
  commuterWorkdays: ATCommuterWorkdayLevel;
  commuterOneWayKm: number;
  specialPaymentMode: ATSpecialPaymentMode;
  customSpecialPayments: number;
  taxableInKindBenefits: number;
  contributions: ATContributionInputs;
}

export interface ATTaxBreakdown extends BaseTaxBreakdown {
  type: "AT";
  incomeTax: number;
  specialPaymentIncomeTax: number;
  employeeSocialContribution: number;
  employeeSpecialSocialContribution: number;
  additionalIncomeTax: number;
}

export interface ATBreakdown {
  type: "AT";
  grossIncome: number;
  regularGrossIncome: number;
  specialPayments: number;
  taxableInKindBenefits: number;
  taxableGrossIncome: number;
  favoredSpecialPayments: number;
  regularTaxedSpecialPayments: number;
  specialPaymentTaxableIncome: number;
  specialPaymentIncomeTax: number;
  specialPaymentMode: ATSpecialPaymentMode;
  taxableIncome: number;
  standardDeduction: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  taxCredit: number;
  incomeTaxBeforeCredits: number;
  transportationTaxCredit: number;
  transportationSurchargeCredit: number;
  elevatedCommuterTaxCredit: number;
  commuterPendlereuroCredit: number;
  singleEarnerOrParentCredit: number;
  commuterAllowance: number;
  commuterAllowanceType: ATCommuterAllowanceType;
  commuterDistanceBand: ATCommuterDistanceBand;
  commuterWorkdays: ATCommuterWorkdayLevel;
  commuterOneWayKm: number;
  specialExpenseDeduction: number;
  churchContributions: number;
  charitableDonations: number;
  charitableDonationLimit: number;
  voluntaryPensionInsurance: number;
  familyBonusChildren: ATFamilyBonusChildren;
  familyBonusChildrenUnder18: number;
  familyBonusChildrenOver18: number;
  familyBonusShare: ATFamilyBonusShare;
  familyCreditStatus: ATFamilyCreditStatus;
  familyBonusPlusCredit: number;
  employeeSocialContribution: {
    name: string;
    amount: number;
    rate: number;
    cap?: number;
  };
  employeeSpecialSocialContribution: {
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
    AT: true;
  }

  interface ContributionInputMap {
    AT: ATContributionInputs;
  }

  interface CalculatorInputMap {
    AT: ATCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AT: ATTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AT: ATBreakdown;
  }
}

export function isATInputs(
  inputs: CalculatorInputs,
): inputs is ATCalculatorInputs {
  return inputs.country === "AT";
}

export function isATTaxBreakdown(taxes: TaxBreakdown): taxes is ATTaxBreakdown {
  return "type" in taxes && taxes.type === "AT";
}

export function isATBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ATBreakdown {
  return breakdown.type === "AT";
}
