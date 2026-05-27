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

export type LUContributionInputs = StandardCountryContributionInputs;
export type LUTaxClass = "class1" | "class1a" | "class2";

export interface LUCalculatorInputs
  extends StandardCountryCalculatorInputs<"LU"> {
  taxClass: LUTaxClass;
  age: number;
  numberOfChildren: number;
  claimSingleParentCredit: boolean;
  childSupportOrAllowancesReceived: number;
}
export type LUTaxBreakdown = StandardCountryTaxBreakdown<"LU">;
export type LUBreakdown = StandardCountryBreakdown<"LU">;

declare module "../types" {
  interface CountryCodeMap {
    LU: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    LU: LUContributionInputs;
  }

  interface CalculatorInputMap {
    LU: LUCalculatorInputs;
  }

  interface TaxBreakdownMap {
    LU: LUTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    LU: LUBreakdown;
  }
}

export function isLUInputs(
  inputs: CalculatorInputs,
): inputs is LUCalculatorInputs {
  return inputs.country === "LU";
}

export function isLUTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is LUTaxBreakdown {
  return "type" in taxes && taxes.type === "LU";
}

export function isLUBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is LUBreakdown {
  return breakdown.type === "LU";
}
