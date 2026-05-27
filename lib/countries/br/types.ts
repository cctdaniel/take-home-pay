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

export interface BRContributionInputs extends StandardCountryContributionInputs {
  educationExpenses: number;
  medicalExpenses: number;
}

export type BRSalaryPackageMode =
  | "includedInGross"
  | "additionalToGross"
  | "none";

export interface BRCalculatorInputs
  extends Omit<StandardCountryCalculatorInputs<"BR">, "contributions"> {
  numberOfDependents: number;
  salaryPackageMode: BRSalaryPackageMode;
  contributions: BRContributionInputs;
}
export interface BRTaxBreakdown extends StandardCountryTaxBreakdown<"BR"> {
  thirteenthSalaryIncomeTax: number;
  thirteenthSalaryInssContribution: number;
}
export interface BRBreakdown extends StandardCountryBreakdown<"BR"> {
  salaryPackageMode: BRSalaryPackageMode;
  enteredGrossSalary: number;
  ordinarySalary: number;
  thirteenthSalary: number;
  ordinaryInssBase: number;
  thirteenthSalaryTaxableIncome: number;
}

declare module "../types" {
  interface CountryCodeMap {
    BR: true;
  }

  interface CurrencyCodeMap {
    BRL: true;
  }

  interface ContributionInputMap {
    BR: BRContributionInputs;
  }

  interface CalculatorInputMap {
    BR: BRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BR: BRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BR: BRBreakdown;
  }
}

export function isBRInputs(
  inputs: CalculatorInputs,
): inputs is BRCalculatorInputs {
  return inputs.country === "BR";
}

export function isBRTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BRTaxBreakdown {
  return "type" in taxes && taxes.type === "BR";
}

export function isBRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BRBreakdown {
  return breakdown.type === "BR";
}
