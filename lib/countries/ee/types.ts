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

export type EESecondPillarRate = "0" | "2" | "4" | "6";

export interface EEContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
}

export interface EECalculatorInputs
  extends StandardCountryCalculatorInputs<"EE"> {
  secondPillarRate: EESecondPillarRate;
  isPensionableAge: boolean;
  pensionBasicExemptionUsedElsewhere: number;
  contributions: EEContributionInputs;
}
export type EETaxBreakdown = StandardCountryTaxBreakdown<"EE">;
export type EEBreakdown = StandardCountryBreakdown<"EE">;

declare module "../types" {
  interface CountryCodeMap {
    EE: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    EE: EEContributionInputs;
  }

  interface CalculatorInputMap {
    EE: EECalculatorInputs;
  }

  interface TaxBreakdownMap {
    EE: EETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    EE: EEBreakdown;
  }
}

export function isEEInputs(
  inputs: CalculatorInputs,
): inputs is EECalculatorInputs {
  return inputs.country === "EE";
}

export function isEETaxBreakdown(
  taxes: TaxBreakdown,
): taxes is EETaxBreakdown {
  return "type" in taxes && taxes.type === "EE";
}

export function isEEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is EEBreakdown {
  return breakdown.type === "EE";
}
