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

export interface HUContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
}

export type HUPitBaseAllowance =
  | "none"
  | "under_25"
  | "mother_under_30"
  | "mother_two_children"
  | "mother_three_children"
  | "mother_four_plus_children";

export interface HUCalculatorInputs
  extends StandardCountryCalculatorInputs<"HU"> {
  pitBaseAllowance: HUPitBaseAllowance;
  claimPersonalAllowance: boolean;
  claimFirstMarriageAllowance: boolean;
  beneficiaryDependents: number;
  totalDependents: number;
  claimFamilyContributionAllowance: boolean;
  contributions: HUContributionInputs;
}
export type HUTaxBreakdown = StandardCountryTaxBreakdown<"HU">;
export type HUBreakdown = StandardCountryBreakdown<"HU">;

declare module "../types" {
  interface CountryCodeMap {
    HU: true;
  }

  interface CurrencyCodeMap {
    HUF: true;
  }

  interface ContributionInputMap {
    HU: HUContributionInputs;
  }

  interface CalculatorInputMap {
    HU: HUCalculatorInputs;
  }

  interface TaxBreakdownMap {
    HU: HUTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    HU: HUBreakdown;
  }
}

export function isHUInputs(
  inputs: CalculatorInputs,
): inputs is HUCalculatorInputs {
  return inputs.country === "HU";
}

export function isHUTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is HUTaxBreakdown {
  return "type" in taxes && taxes.type === "HU";
}

export function isHUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is HUBreakdown {
  return breakdown.type === "HU";
}
