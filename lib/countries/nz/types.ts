import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type NZResidencyType = "tax_resident" | "non_resident";

export type NZKiwiSaverRate =
  | "none"
  | "temporary_3"
  | "rate_3_5"
  | "rate_4"
  | "rate_6"
  | "rate_8"
  | "rate_10";

export interface NZContributionInputs {
  kiwiSaverRate: NZKiwiSaverRate;
  payrollGivingDonations: number;
}

export interface NZCalculatorInputs extends BaseCalculatorInputs {
  country: "NZ";
  residencyType: NZResidencyType;
  hasStudentLoan: boolean;
  claimsIndependentEarnerTaxCredit: boolean;
  contributions: NZContributionInputs;
}

export interface NZTaxBreakdown extends BaseTaxBreakdown {
  type: "NZ";
  grossIncomeTax: number;
  incomeTax: number;
  independentEarnerTaxCredit: number;
  donationTaxCredit: number;
  accEarnersLevy: number;
  studentLoanRepayment: number;
}

export interface NZBreakdown {
  type: "NZ";
  grossIncome: number;
  residencyType: NZResidencyType;
  isTaxResident: boolean;
  taxableIncome: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  taxCredits: {
    independentEarnerTaxCredit: number;
    independentEarnerTaxCreditEligible: boolean;
    donationTaxCredit: number;
    donationTaxCreditPotential: number;
    donationCreditAppliedAgainstIncomeTaxOnly: boolean;
  };
  acc: {
    earnersLevy: number;
    rate: number;
    liableEarnings: number;
    maximumEarnings: number;
    maximumLevy: number;
    period: string;
  };
  studentLoan: {
    applies: boolean;
    repayment: number;
    repaymentRate: number;
    annualThreshold: number;
  };
  kiwiSaver: {
    employeeRate: number;
    employeeContribution: number;
    employerRate: number;
    employerContributionBeforeEsct: number;
    defaultEmployeeRate: number;
    minimumEmployerRate: number;
  };
  donations: {
    payrollGivingDonations: number;
    eligibleDonationAmount: number;
    minimumGift: number;
    creditRate: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    NZD: true;
  }

  interface CountryCodeMap {
    NZ: true;
  }

  interface ContributionInputMap {
    NZ: NZContributionInputs;
  }

  interface CalculatorInputMap {
    NZ: NZCalculatorInputs;
  }

  interface TaxBreakdownMap {
    NZ: NZTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    NZ: NZBreakdown;
  }
}

export function isNZInputs(
  inputs: CalculatorInputs,
): inputs is NZCalculatorInputs {
  return inputs.country === "NZ";
}

export function isNZTaxBreakdown(taxes: TaxBreakdown): taxes is NZTaxBreakdown {
  return "type" in taxes && taxes.type === "NZ";
}

export function isNZBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is NZBreakdown {
  return breakdown.type === "NZ";
}
