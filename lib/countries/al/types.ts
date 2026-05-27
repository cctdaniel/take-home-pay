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

export type ALContributionInputs = StandardCountryContributionInputs;
export interface ALCalculatorInputs
  extends StandardCountryCalculatorInputs<"AL"> {
  taxableNonCashBenefits: number;
  appliesEmploymentAllowance: boolean;
  claimsFamilyDivaDeductions: boolean;
  numberOfDependentChildren: number;
}
export type ALTaxBreakdown = StandardCountryTaxBreakdown<"AL">;
export interface ALBreakdown extends StandardCountryBreakdown<"AL"> {
  appliesEmploymentAllowance: boolean;
  claimsFamilyDivaDeductions: boolean;
  numberOfDependentChildren: number;
  dependentChildDeduction: number;
  educationExpenseLimit: number;
  monthlySocialInsuranceBase: number;
}

declare module "../types" {
  interface CountryCodeMap {
    AL: true;
  }

  interface CurrencyCodeMap {
    ALL: true;
  }

  interface ContributionInputMap {
    AL: ALContributionInputs;
  }

  interface CalculatorInputMap {
    AL: ALCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AL: ALTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AL: ALBreakdown;
  }
}

export function isALInputs(
  inputs: CalculatorInputs,
): inputs is ALCalculatorInputs {
  return inputs.country === "AL";
}

export function isALTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is ALTaxBreakdown {
  return "type" in taxes && taxes.type === "AL";
}

export function isALBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ALBreakdown {
  return breakdown.type === "AL";
}
