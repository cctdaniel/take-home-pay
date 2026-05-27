import type {
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";
import type {
  StandardCountryBreakdown,
  StandardCountryCalculatorInputs,
  StandardCountryContributionInputs,
  StandardCountryTaxBreakdown,
} from "../shared/standard-country";

export type LKEmploymentType =
  | "primary"
  | "secondary"
  | "foreignEmployer"
  | "nonResidentNonCitizen";
export type LKTerminalBenefitTreatment = "approvedOrEtf" | "otherOrUnapproved";

export interface LKContributionInputs
  extends StandardCountryContributionInputs {
  charitableDonations: number;
  housingExpenses: number;
}

export interface LKCalculatorInputs
  extends Omit<StandardCountryCalculatorInputs<"LK">, "contributions"> {
  employmentType: LKEmploymentType;
  epfCovered: boolean;
  annualLumpSumPayments: number;
  taxableNonCashBenefits: number;
  taxableTerminalBenefits: number;
  terminalBenefitTreatment: LKTerminalBenefitTreatment;
  primaryMonthlyRemuneration: number;
  epfContributionBase?: number;
  contributions: LKContributionInputs;
}

export type LKTaxBreakdown = StandardCountryTaxBreakdown<"LK">;
export interface LKBreakdown extends StandardCountryBreakdown<"LK"> {
  regularCashIncome: number;
  cashLumpSumPayments: number;
  taxableNonCashBenefits: number;
  taxableTerminalBenefits: number;
  terminalBenefitsTax: number;
  terminalBenefitTreatment: LKTerminalBenefitTreatment;
  epfContributionBase: number;
  employerContributionBase: number;
  employerEpfContribution: number;
  employerEtfContribution: number;
  totalEmployerStatutoryContributions: number;
  estimatedEmployerSalaryCost: number;
  secondaryEmploymentRate?: number;
}

declare module "../types" {
  interface CountryCodeMap {
    LK: true;
  }

  interface CurrencyCodeMap {
    LKR: true;
  }

  interface ContributionInputMap {
    LK: LKContributionInputs;
  }

  interface CalculatorInputMap {
    LK: LKCalculatorInputs;
  }

  interface TaxBreakdownMap {
    LK: LKTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    LK: LKBreakdown;
  }
}

export function isLKInputs(
  inputs: CalculatorInputs,
): inputs is LKCalculatorInputs {
  return inputs.country === "LK";
}

export function isLKTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is LKTaxBreakdown {
  return "type" in taxes && taxes.type === "LK";
}

export function isLKBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is LKBreakdown {
  return breakdown.type === "LK";
}
