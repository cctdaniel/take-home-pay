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

export type BBResidencyStatus = "resident" | "nonResident";
export type BBAgeAllowanceStatus = "standard" | "age40Plus" | "pensioner60Plus";
export type BBCharityType = "registeredNonExempt" | "exemptCharity";

export interface BBContributionInputs extends StandardCountryContributionInputs {
  charitableDonations: number;
  medicalExpenses: number;
  qualifyingExpenses: number;
  housingExpenses: number;
}

export interface BBCalculatorInputs extends StandardCountryCalculatorInputs<"BB"> {
  residencyStatus: BBResidencyStatus;
  ageAllowanceStatus: BBAgeAllowanceStatus;
  hasEligibleSpouse: boolean;
  charityType: BBCharityType;
  contributions: BBContributionInputs;
}
export type BBTaxBreakdown = StandardCountryTaxBreakdown<"BB">;
export type BBBreakdown = StandardCountryBreakdown<"BB">;

declare module "../types" {
  interface CountryCodeMap {
    BB: true;
  }

  interface CurrencyCodeMap {
    BBD: true;
  }

  interface ContributionInputMap {
    BB: BBContributionInputs;
  }

  interface CalculatorInputMap {
    BB: BBCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BB: BBTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BB: BBBreakdown;
  }
}

export function isBBInputs(
  inputs: CalculatorInputs,
): inputs is BBCalculatorInputs {
  return inputs.country === "BB";
}

export function isBBTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BBTaxBreakdown {
  return "type" in taxes && taxes.type === "BB";
}

export function isBBBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BBBreakdown {
  return breakdown.type === "BB";
}
