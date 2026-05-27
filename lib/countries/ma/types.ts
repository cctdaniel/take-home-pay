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

export type MAContributionInputs = StandardCountryContributionInputs;
export interface MACalculatorInputs
  extends StandardCountryCalculatorInputs<"MA"> {
  numberOfDependents: number;
  firstEmploymentExemption: boolean;
  cnssAmoMonthlyWage: number;
}
export type MATaxBreakdown = StandardCountryTaxBreakdown<"MA">;
export interface MABreakdown extends StandardCountryBreakdown<"MA"> {
  numberOfDependents: number;
  firstEmploymentExemption: boolean;
  cnssAmoMonthlyWage: number;
  cnssSocialAnnualBase: number;
  amoAnnualBase: number;
}

declare module "../types" {
  interface CountryCodeMap {
    MA: true;
  }

  interface CurrencyCodeMap {
    MAD: true;
  }

  interface ContributionInputMap {
    MA: MAContributionInputs;
  }

  interface CalculatorInputMap {
    MA: MACalculatorInputs;
  }

  interface TaxBreakdownMap {
    MA: MATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    MA: MABreakdown;
  }
}

export function isMAInputs(
  inputs: CalculatorInputs,
): inputs is MACalculatorInputs {
  return inputs.country === "MA";
}

export function isMATaxBreakdown(
  taxes: TaxBreakdown,
): taxes is MATaxBreakdown {
  return "type" in taxes && taxes.type === "MA";
}

export function isMABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MABreakdown {
  return breakdown.type === "MA";
}
