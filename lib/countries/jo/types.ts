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

export type JOContributionInputs = StandardCountryContributionInputs;
export interface JOCalculatorInputs
  extends StandardCountryCalculatorInputs<"JO"> {
  hasResidentDependents: boolean;
  sscMonthlyWage: number;
}
export type JOTaxBreakdown = StandardCountryTaxBreakdown<"JO">;
export interface JOBreakdown extends StandardCountryBreakdown<"JO"> {
  hasResidentDependents: boolean;
  sscMonthlyWage: number;
  sscAnnualWage: number;
}

declare module "../types" {
  interface CountryCodeMap {
    JO: true;
  }

  interface CurrencyCodeMap {
    JOD: true;
  }

  interface ContributionInputMap {
    JO: JOContributionInputs;
  }

  interface CalculatorInputMap {
    JO: JOCalculatorInputs;
  }

  interface TaxBreakdownMap {
    JO: JOTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    JO: JOBreakdown;
  }
}

export function isJOInputs(
  inputs: CalculatorInputs,
): inputs is JOCalculatorInputs {
  return inputs.country === "JO";
}

export function isJOTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is JOTaxBreakdown {
  return "type" in taxes && taxes.type === "JO";
}

export function isJOBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is JOBreakdown {
  return breakdown.type === "JO";
}
