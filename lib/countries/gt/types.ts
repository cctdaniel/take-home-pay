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

export interface GTContributionInputs extends StandardCountryContributionInputs {
  qualifyingExpenses: number;
  charitableDonations: number;
  insurancePremiums: number;
}

export interface GTCalculatorInputs extends StandardCountryCalculatorInputs<"GT"> {
  contributions: GTContributionInputs;
}
export type GTTaxBreakdown = StandardCountryTaxBreakdown<"GT">;
export type GTBreakdown = StandardCountryBreakdown<"GT">;

declare module "../types" {
  interface CountryCodeMap {
    GT: true;
  }

  interface CurrencyCodeMap {
    GTQ: true;
  }

  interface ContributionInputMap {
    GT: GTContributionInputs;
  }

  interface CalculatorInputMap {
    GT: GTCalculatorInputs;
  }

  interface TaxBreakdownMap {
    GT: GTTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    GT: GTBreakdown;
  }
}

export function isGTInputs(
  inputs: CalculatorInputs,
): inputs is GTCalculatorInputs {
  return inputs.country === "GT";
}

export function isGTTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is GTTaxBreakdown {
  return "type" in taxes && taxes.type === "GT";
}

export function isGTBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is GTBreakdown {
  return breakdown.type === "GT";
}
