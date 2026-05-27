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

export type EGContributionInputs = StandardCountryContributionInputs;
export interface EGCalculatorInputs extends StandardCountryCalculatorInputs<"EG"> {
  socialInsuranceCovered: boolean;
  socialInsuranceSalaryMonthly: number;
}
export type EGTaxBreakdown = StandardCountryTaxBreakdown<"EG">;
export interface EGBreakdown extends StandardCountryBreakdown<"EG"> {
  socialInsuranceCovered: boolean;
  socialInsuranceSalaryMonthly: number;
  socialInsuranceSalaryAnnual: number;
}

declare module "../types" {
  interface CountryCodeMap {
    EG: true;
  }

  interface CurrencyCodeMap {
    EGP: true;
  }

  interface ContributionInputMap {
    EG: EGContributionInputs;
  }

  interface CalculatorInputMap {
    EG: EGCalculatorInputs;
  }

  interface TaxBreakdownMap {
    EG: EGTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    EG: EGBreakdown;
  }
}

export function isEGInputs(
  inputs: CalculatorInputs,
): inputs is EGCalculatorInputs {
  return inputs.country === "EG";
}

export function isEGTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is EGTaxBreakdown {
  return "type" in taxes && taxes.type === "EG";
}

export function isEGBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is EGBreakdown {
  return breakdown.type === "EG";
}
