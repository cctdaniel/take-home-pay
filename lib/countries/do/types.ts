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

export interface DOContributionInputs extends StandardCountryContributionInputs {
  educationExpenses: number;
}

export type DOChristmasSalaryMode =
  | "includedInGross"
  | "additionalToGross"
  | "none";

export interface DOCalculatorInputs extends StandardCountryCalculatorInputs<"DO"> {
  christmasSalaryMode: DOChristmasSalaryMode;
  sdssCovered: boolean;
  sdssSalaryMonthly: number;
  fringeBenefitsTaxedToEmployee: boolean;
  contributions: DOContributionInputs;
}
export type DOTaxBreakdown = StandardCountryTaxBreakdown<"DO">;
export interface DOBreakdown extends StandardCountryBreakdown<"DO"> {
  christmasSalaryMode: DOChristmasSalaryMode;
  enteredGrossSalary: number;
  ordinarySalary: number;
  christmasSalary: number;
  isrAndSddsSalaryBase: number;
  sdssCovered: boolean;
  sdssSalaryMonthly: number;
  sdssSalaryAnnual: number;
  fringeBenefitsTaxedToEmployee: boolean;
}

declare module "../types" {
  interface CountryCodeMap {
    DO: true;
  }

  interface CurrencyCodeMap {
    DOP: true;
  }

  interface ContributionInputMap {
    DO: DOContributionInputs;
  }

  interface CalculatorInputMap {
    DO: DOCalculatorInputs;
  }

  interface TaxBreakdownMap {
    DO: DOTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    DO: DOBreakdown;
  }
}

export function isDOInputs(
  inputs: CalculatorInputs,
): inputs is DOCalculatorInputs {
  return inputs.country === "DO";
}

export function isDOTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is DOTaxBreakdown {
  return "type" in taxes && taxes.type === "DO";
}

export function isDOBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is DOBreakdown {
  return breakdown.type === "DO";
}
