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

export type TRDisabilityDegree = "none" | "first" | "second" | "third";
export type TRDonationReliefCategory =
  | "none"
  | "generalPublicBenefit"
  | "fullEducationHealth";

export interface TRContributionInputs extends StandardCountryContributionInputs {
  insurancePremiums: number;
  educationExpenses: number;
  charitableDonations: number;
  qualifyingExpenses: number;
}

export interface TRCalculatorInputs
  extends StandardCountryCalculatorInputs<"TR"> {
  disabilityDegree: TRDisabilityDegree;
  donationReliefCategory: TRDonationReliefCategory;
  contributions: TRContributionInputs;
}
export type TRTaxBreakdown = StandardCountryTaxBreakdown<"TR">;
export type TRBreakdown = StandardCountryBreakdown<"TR">;

declare module "../types" {
  interface CountryCodeMap {
    TR: true;
  }

  interface CurrencyCodeMap {
    TRY: true;
  }

  interface ContributionInputMap {
    TR: TRContributionInputs;
  }

  interface CalculatorInputMap {
    TR: TRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    TR: TRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    TR: TRBreakdown;
  }
}

export function isTRInputs(
  inputs: CalculatorInputs,
): inputs is TRCalculatorInputs {
  return inputs.country === "TR";
}

export function isTRTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is TRTaxBreakdown {
  return "type" in taxes && taxes.type === "TR";
}

export function isTRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is TRBreakdown {
  return breakdown.type === "TR";
}
