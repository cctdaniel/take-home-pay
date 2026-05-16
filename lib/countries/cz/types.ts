import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type CZResidencyType = "resident" | "non_resident";

export interface CZContributionInputs {
  retirementSavingsContribution: number;
  charitableDonations: number;
}

export interface CZTaxReliefInputs {
  numberOfChildren: number;
  hasSpouseCredit: boolean;
}

export interface CZCalculatorInputs extends BaseCalculatorInputs {
  country: "CZ";
  residencyType: CZResidencyType;
  contributions: CZContributionInputs;
  taxReliefs: CZTaxReliefInputs;
}

export interface CZTaxBreakdown extends BaseTaxBreakdown {
  type: "CZ";
  incomeTax: number;
  socialSecurity: number;
  healthInsurance: number;
  childTaxBonus: number;
}

export interface CZBreakdown {
  type: "CZ";
  grossIncome: number;
  isResident: boolean;
  taxableIncomeBeforeRounding: number;
  taxableIncome: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  deductions: {
    retirementSavings: number;
    charitableDonations: number;
    requestedCharitableDonations: number;
    total: number;
  };
  taxCredits: {
    basicTaxpayerCredit: number;
    spouseCredit: number;
    childCredit: number;
    childCreditAgainstTax: number;
    childTaxBonus: number;
    totalNonRefundableCredits: number;
  };
  incomeTax: {
    grossIncomeTax: number;
    finalIncomeTax: number;
    taxBandThreshold: number;
    higherRateTaxableIncome: number;
  };
  socialSecurity: {
    employee: number;
    employer: number;
    employeeRate: number;
    employerRate: number;
    pensionEmployee: number;
    sicknessEmployee: number;
    assessmentBase: number;
    annualCeiling: number;
  };
  healthInsurance: {
    employee: number;
    employer: number;
    employeeRate: number;
    employerRate: number;
    assessmentBase: number;
  };
  taxReliefs: CZTaxReliefInputs;
}

declare module "../types" {
  interface CountryCodeMap {
    CZ: true;
  }

  interface CurrencyCodeMap {
    CZK: true;
  }

  interface ContributionInputMap {
    CZ: CZContributionInputs;
  }

  interface CalculatorInputMap {
    CZ: CZCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CZ: CZTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CZ: CZBreakdown;
  }
}

export function isCZInputs(
  inputs: CalculatorInputs,
): inputs is CZCalculatorInputs {
  return inputs.country === "CZ";
}

export function isCZTaxBreakdown(taxes: TaxBreakdown): taxes is CZTaxBreakdown {
  return "type" in taxes && taxes.type === "CZ";
}

export function isCZBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CZBreakdown {
  return breakdown.type === "CZ";
}
