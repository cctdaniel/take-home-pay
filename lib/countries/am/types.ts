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

export type AMContributionInputs = StandardCountryContributionInputs;
export type AMPensionParticipation =
  | "funded_pension"
  | "not_participating";
export type AMHealthInsuranceStatus = "applies" | "not_applicable";
export interface AMCalculatorInputs
  extends StandardCountryCalculatorInputs<"AM"> {
  pensionParticipation: AMPensionParticipation;
  healthInsuranceStatus: AMHealthInsuranceStatus;
}
export type AMTaxBreakdown = StandardCountryTaxBreakdown<"AM">;
export type AMBreakdown = StandardCountryBreakdown<"AM">;

declare module "../types" {
  interface CountryCodeMap {
    AM: true;
  }

  interface CurrencyCodeMap {
    AMD: true;
  }

  interface ContributionInputMap {
    AM: AMContributionInputs;
  }

  interface CalculatorInputMap {
    AM: AMCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AM: AMTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AM: AMBreakdown;
  }
}

export function isAMInputs(
  inputs: CalculatorInputs,
): inputs is AMCalculatorInputs {
  return inputs.country === "AM";
}

export function isAMTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is AMTaxBreakdown {
  return "type" in taxes && taxes.type === "AM";
}

export function isAMBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is AMBreakdown {
  return breakdown.type === "AM";
}
