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

export type SVContributionInputs = StandardCountryContributionInputs;
export type SVCalculatorInputs = StandardCountryCalculatorInputs<"SV">;
export type SVTaxBreakdown = StandardCountryTaxBreakdown<"SV">;
export type SVBreakdown = StandardCountryBreakdown<"SV">;

declare module "../types" {
  interface CountryCodeMap {
    SV: true;
  }

  interface CurrencyCodeMap {
    USD: true;
  }

  interface ContributionInputMap {
    SV: SVContributionInputs;
  }

  interface CalculatorInputMap {
    SV: SVCalculatorInputs;
  }

  interface TaxBreakdownMap {
    SV: SVTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SV: SVBreakdown;
  }
}

export function isSVInputs(
  inputs: CalculatorInputs,
): inputs is SVCalculatorInputs {
  return inputs.country === "SV";
}

export function isSVTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is SVTaxBreakdown {
  return "type" in taxes && taxes.type === "SV";
}

export function isSVBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SVBreakdown {
  return breakdown.type === "SV";
}
