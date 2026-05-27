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

export type BGContributionInputs = StandardCountryContributionInputs;
export type BGDonationReliefCategory =
  | "general_5"
  | "culture_15"
  | "medical_50";

export interface BGCalculatorInputs
  extends StandardCountryCalculatorInputs<"BG"> {
  numberOfChildren: number;
  numberOfDisabledChildren: number;
  hasReducedWorkingCapacity: boolean;
  donationReliefCategory: BGDonationReliefCategory;
}
export type BGTaxBreakdown = StandardCountryTaxBreakdown<"BG">;
export type BGBreakdown = StandardCountryBreakdown<"BG">;

declare module "../types" {
  interface CountryCodeMap {
    BG: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    BG: BGContributionInputs;
  }

  interface CalculatorInputMap {
    BG: BGCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BG: BGTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BG: BGBreakdown;
  }
}

export function isBGInputs(
  inputs: CalculatorInputs,
): inputs is BGCalculatorInputs {
  return inputs.country === "BG";
}

export function isBGTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BGTaxBreakdown {
  return "type" in taxes && taxes.type === "BG";
}

export function isBGBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BGBreakdown {
  return breakdown.type === "BG";
}
