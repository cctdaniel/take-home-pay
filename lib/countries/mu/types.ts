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

export interface MUContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  insurancePremiums: number;
  charitableDonations: number;
  educationExpenses: number;
  housingExpenses: number;
  qualifyingExpenses: number;
  tertiaryEducationExpenses: number;
  carerWages: number;
}

export interface MUCalculatorInputs
  extends StandardCountryCalculatorInputs<"MU"> {
  numberOfDependents: number;
  numberOfPrivateSchoolDependents: number;
  numberOfTertiaryEducationDependents: number;
  contributions: MUContributionInputs;
}
export type MUTaxBreakdown = StandardCountryTaxBreakdown<"MU">;
export type MUBreakdown = StandardCountryBreakdown<"MU">;

declare module "../types" {
  interface CountryCodeMap {
    MU: true;
  }

  interface CurrencyCodeMap {
    MUR: true;
  }

  interface ContributionInputMap {
    MU: MUContributionInputs;
  }

  interface CalculatorInputMap {
    MU: MUCalculatorInputs;
  }

  interface TaxBreakdownMap {
    MU: MUTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    MU: MUBreakdown;
  }
}

export function isMUInputs(
  inputs: CalculatorInputs,
): inputs is MUCalculatorInputs {
  return inputs.country === "MU";
}

export function isMUTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is MUTaxBreakdown {
  return "type" in taxes && taxes.type === "MU";
}

export function isMUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MUBreakdown {
  return breakdown.type === "MU";
}
