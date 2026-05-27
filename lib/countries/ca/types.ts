import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";
import type { CanadaProvinceCode } from "./constants/tax-year-2026";

export interface CAContributionInputs {
  rrspContribution: number;
  fhsaContribution: number;
  registeredPensionContribution: number;
  unionDues: number;
  childcareExpenses: number;
  charitableDonations: number;
}

export type CAFederalFamilyCreditType =
  | "none"
  | "spouse_or_common_law"
  | "eligible_dependant";

export interface CACalculatorInputs extends BaseCalculatorInputs {
  country: "CA";
  province: CanadaProvinceCode;
  taxableNonCashBenefits: number;
  federalFamilyCreditType: CAFederalFamilyCreditType;
  federalFamilyCreditDependentNetIncome: number;
  numberOfChildrenUnder7: number;
  numberOfChildrenAge7To16: number;
  numberOfDisabledChildren: number;
  contributions: CAContributionInputs;
}

export interface CATaxBreakdown extends BaseTaxBreakdown {
  type: "CA";
  incomeTax: number;
  provincialIncomeTax: number;
  cpp: number;
  cpp2: number;
  qpp: number;
  qpp2: number;
  qpip: number;
  ei: number;
  federalIncomeTaxBeforeCredits: number;
  federalTaxCredits: number;
  quebecAbatement: number;
  provincialIncomeTaxBeforeCredits: number;
  provincialTaxCredits: number;
  ontarioSurtax: number;
  ontarioHealthPremium: number;
}

export interface CABreakdown {
  type: "CA";
  grossIncome: number;
  taxableNonCashBenefits: number;
  taxableGrossIncome: number;
  taxableIncome: number;
  provincialTaxableIncome: number;
  province: CanadaProvinceCode;
  provinceName: string;
  federalBracketTaxes: Array<TaxBracket & { tax: number }>;
  provincialBracketTaxes: Array<TaxBracket & { tax: number }>;
  pension: {
    plan: "CPP" | "QPP";
    pensionableEarnings: number;
    employeeRate: number;
    maximumEmployeeContribution: number;
    additionalPensionableEarnings: number;
    secondAdditionalEmployeeRate: number;
    maximumSecondAdditionalEmployeeContribution: number;
  };
  ei: {
    insurableEarnings: number;
    employeeRate: number;
    maximumEmployeePremium: number;
  };
  qpip?: {
    insurableEarnings: number;
    employeeRate: number;
    maximumEmployeePremium: number;
  };
  taxCredits: {
    federalBasicPersonalAmount: number;
    federalFamilyAmount: number;
    canadaEmploymentAmount: number;
    basePensionCreditAmount: number;
    eiPremiumCreditAmount: number;
    qpipPremiumCreditAmount: number;
    federalCredit: number;
    federalDonationCredit: number;
    provincialBasicPersonalAmount: number;
    provincialCredit: number;
    provincialDonationCredit: number;
    quebecAbatement: number;
    ontarioSurtax: number;
    ontarioHealthPremium: number;
  };
  childcare: {
    requestedExpenses: number;
    allowedExpenses: number;
    limit: number;
    numberOfChildrenUnder7: number;
    numberOfChildrenAge7To16: number;
    numberOfDisabledChildren: number;
  };
  taxableIncomeDeductions: {
    enhancedPensionDeduction: number;
    quebecWorkersDeduction: number;
  };
  voluntaryContributions: {
    rrspContribution: number;
    rrspContributionLimit: number;
    fhsaContribution: number;
    fhsaContributionLimit: number;
    registeredPensionContribution: number;
    registeredPensionContributionLimit: number;
    unionDues: number;
    childcareExpenses: number;
    charitableDonations: number;
    charitableDonationLimit: number;
    charitableDonationCredit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    CAD: true;
  }

  interface CountryCodeMap {
    CA: true;
  }

  interface ContributionInputMap {
    CA: CAContributionInputs;
  }

  interface CalculatorInputMap {
    CA: CACalculatorInputs;
  }

  interface TaxBreakdownMap {
    CA: CATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CA: CABreakdown;
  }
}

export function isCAInputs(inputs: CalculatorInputs): inputs is CACalculatorInputs {
  return inputs.country === "CA";
}

export function isCATaxBreakdown(taxes: TaxBreakdown): taxes is CATaxBreakdown {
  return "type" in taxes && taxes.type === "CA";
}

export function isCABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CABreakdown {
  return breakdown.type === "CA";
}
