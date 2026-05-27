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

export interface PAContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  housingExpenses: number;
  educationExpenses: number;
  medicalExpenses: number;
  charitableDonations: number;
}

export interface PACalculatorInputs extends StandardCountryCalculatorInputs<"PA"> {
  isMarried: boolean;
  educationStudents: number;
  contributions: PAContributionInputs;
}
export type PATaxBreakdown = StandardCountryTaxBreakdown<"PA">;
export type PABreakdown = StandardCountryBreakdown<"PA">;

declare module "../types" {
  interface CountryCodeMap {
    PA: true;
  }

  interface CurrencyCodeMap {
    USD: true;
  }

  interface ContributionInputMap {
    PA: PAContributionInputs;
  }

  interface CalculatorInputMap {
    PA: PACalculatorInputs;
  }

  interface TaxBreakdownMap {
    PA: PATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PA: PABreakdown;
  }
}

export function isPAInputs(
  inputs: CalculatorInputs,
): inputs is PACalculatorInputs {
  return inputs.country === "PA";
}

export function isPATaxBreakdown(
  taxes: TaxBreakdown,
): taxes is PATaxBreakdown {
  return "type" in taxes && taxes.type === "PA";
}

export function isPABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PABreakdown {
  return breakdown.type === "PA";
}
