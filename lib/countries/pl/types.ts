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

export type PLPpkRate = "0" | "2" | "3" | "4";

export type PLPitZeroRelief =
  | "none"
  | "youth_under_26"
  | "return_relief"
  | "family_4plus"
  | "working_senior";

export interface PLContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  charitableDonations: number;
  qualifyingExpenses: number;
}

export interface PLCalculatorInputs
  extends StandardCountryCalculatorInputs<"PL"> {
  numberOfChildren: number;
  ppkRate: PLPpkRate;
  pitZeroRelief: PLPitZeroRelief;
  contributions: PLContributionInputs;
}
export type PLTaxBreakdown = StandardCountryTaxBreakdown<"PL">;
export type PLBreakdown = StandardCountryBreakdown<"PL">;

declare module "../types" {
  interface CountryCodeMap {
    PL: true;
  }

  interface CurrencyCodeMap {
    PLN: true;
  }

  interface ContributionInputMap {
    PL: PLContributionInputs;
  }

  interface CalculatorInputMap {
    PL: PLCalculatorInputs;
  }

  interface TaxBreakdownMap {
    PL: PLTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PL: PLBreakdown;
  }
}

export function isPLInputs(
  inputs: CalculatorInputs,
): inputs is PLCalculatorInputs {
  return inputs.country === "PL";
}

export function isPLTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is PLTaxBreakdown {
  return "type" in taxes && taxes.type === "PL";
}

export function isPLBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PLBreakdown {
  return breakdown.type === "PL";
}
