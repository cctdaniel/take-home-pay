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

export interface BAContributionInputs extends StandardCountryContributionInputs {
  mortgageInterest: number;
  lifeInsurancePremium: number;
  educationExpenses: number;
}
export type BAEntity = "fbih" | "rs" | "bd";
export interface BACalculatorInputs
  extends Omit<StandardCountryCalculatorInputs<"BA">, "contributions"> {
  entity: BAEntity;
  hasDependentSpouse: boolean;
  dependentChildren: number;
  dependentParents: number;
  otherDependents: number;
  bdDisabilityPercent: number;
  bdPermanentDisability: boolean;
  contributions: BAContributionInputs;
}
export type BATaxBreakdown = StandardCountryTaxBreakdown<"BA">;
export type BABreakdown = StandardCountryBreakdown<"BA">;

declare module "../types" {
  interface CountryCodeMap {
    BA: true;
  }

  interface CurrencyCodeMap {
    BAM: true;
  }

  interface ContributionInputMap {
    BA: BAContributionInputs;
  }

  interface CalculatorInputMap {
    BA: BACalculatorInputs;
  }

  interface TaxBreakdownMap {
    BA: BATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BA: BABreakdown;
  }
}

export function isBAInputs(
  inputs: CalculatorInputs,
): inputs is BACalculatorInputs {
  return inputs.country === "BA";
}

export function isBATaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BATaxBreakdown {
  return "type" in taxes && taxes.type === "BA";
}

export function isBABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BABreakdown {
  return breakdown.type === "BA";
}
