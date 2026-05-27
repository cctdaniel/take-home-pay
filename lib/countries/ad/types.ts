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

export type ADContributionInputs = StandardCountryContributionInputs;
export interface ADCalculatorInputs
  extends StandardCountryCalculatorInputs<"AD"> {
  hasNonWorkingSpouseOrPartner: boolean;
  isDisabledTaxpayer: boolean;
  numberOfFamilyDependents: number;
  numberOfDisabledDependents: number;
}
export type ADTaxBreakdown = StandardCountryTaxBreakdown<"AD">;
export type ADBreakdown = StandardCountryBreakdown<"AD">;

declare module "../types" {
  interface CountryCodeMap {
    AD: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    AD: ADContributionInputs;
  }

  interface CalculatorInputMap {
    AD: ADCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AD: ADTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AD: ADBreakdown;
  }
}

export function isADInputs(
  inputs: CalculatorInputs,
): inputs is ADCalculatorInputs {
  return inputs.country === "AD";
}

export function isADTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is ADTaxBreakdown {
  return "type" in taxes && taxes.type === "AD";
}

export function isADBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ADBreakdown {
  return breakdown.type === "AD";
}
