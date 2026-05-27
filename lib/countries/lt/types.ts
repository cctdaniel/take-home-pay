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

export type LTSecondPillarRate = "0" | "3";
export type LTDisabilityNpdType =
  | "none"
  | "participation_0_25"
  | "participation_30_55";

export type LTContributionInputs = StandardCountryContributionInputs;

export interface LTCalculatorInputs
  extends StandardCountryCalculatorInputs<"LT"> {
  secondPillarRate: LTSecondPillarRate;
  disabilityNpdType: LTDisabilityNpdType;
}
export type LTTaxBreakdown = StandardCountryTaxBreakdown<"LT">;
export type LTBreakdown = StandardCountryBreakdown<"LT">;

declare module "../types" {
  interface CountryCodeMap {
    LT: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    LT: LTContributionInputs;
  }

  interface CalculatorInputMap {
    LT: LTCalculatorInputs;
  }

  interface TaxBreakdownMap {
    LT: LTTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    LT: LTBreakdown;
  }
}

export function isLTInputs(
  inputs: CalculatorInputs,
): inputs is LTCalculatorInputs {
  return inputs.country === "LT";
}

export function isLTTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is LTTaxBreakdown {
  return "type" in taxes && taxes.type === "LT";
}

export function isLTBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is LTBreakdown {
  return breakdown.type === "LT";
}
