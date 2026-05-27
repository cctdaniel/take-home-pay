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

export interface COContributionInputs
  extends StandardCountryContributionInputs {
  insurancePremiums: number;
  housingExpenses: number;
}

export interface COCalculatorInputs
  extends Omit<StandardCountryCalculatorInputs<"CO">, "contributions"> {
  numberOfDependents: number;
  contributions: COContributionInputs;
}

export type COTaxBreakdown = StandardCountryTaxBreakdown<"CO">;
export type COBreakdown = StandardCountryBreakdown<"CO">;

declare module "../types" {
  interface CountryCodeMap {
    CO: true;
  }

  interface CurrencyCodeMap {
    COP: true;
  }

  interface ContributionInputMap {
    CO: COContributionInputs;
  }

  interface CalculatorInputMap {
    CO: COCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CO: COTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CO: COBreakdown;
  }
}

export function isCOInputs(
  inputs: CalculatorInputs,
): inputs is COCalculatorInputs {
  return inputs.country === "CO";
}

export function isCOTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is COTaxBreakdown {
  return "type" in taxes && taxes.type === "CO";
}

export function isCOBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is COBreakdown {
  return breakdown.type === "CO";
}
