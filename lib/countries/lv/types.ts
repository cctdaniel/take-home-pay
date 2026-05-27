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

export interface LVContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  qualifyingExpenses: number;
}

export interface LVCalculatorInputs
  extends StandardCountryCalculatorInputs<"LV"> {
  numberOfDependents: number;
  isPensioner: boolean;
  pensionerAllowanceUsedElsewhere: number;
  contributions: LVContributionInputs;
}
export type LVTaxBreakdown = StandardCountryTaxBreakdown<"LV">;
export type LVBreakdown = StandardCountryBreakdown<"LV">;

declare module "../types" {
  interface CountryCodeMap {
    LV: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    LV: LVContributionInputs;
  }

  interface CalculatorInputMap {
    LV: LVCalculatorInputs;
  }

  interface TaxBreakdownMap {
    LV: LVTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    LV: LVBreakdown;
  }
}

export function isLVInputs(
  inputs: CalculatorInputs,
): inputs is LVCalculatorInputs {
  return inputs.country === "LV";
}

export function isLVTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is LVTaxBreakdown {
  return "type" in taxes && taxes.type === "LV";
}

export function isLVBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is LVBreakdown {
  return breakdown.type === "LV";
}
