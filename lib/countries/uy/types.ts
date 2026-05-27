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

export type UYHousingCreditType = "none" | "rent" | "mortgage";
export type UYAguinaldoMode = "includedInGross" | "additionalToGross" | "none";

export interface UYContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  housingExpenses: number;
}

export interface UYCalculatorInputs extends StandardCountryCalculatorInputs<"UY"> {
  numberOfChildren: number;
  numberOfDisabledChildren: number;
  housingCreditType: UYHousingCreditType;
  aguinaldoMode: UYAguinaldoMode;
  contributions: UYContributionInputs;
}
export interface UYTaxBreakdown extends StandardCountryTaxBreakdown<"UY"> {
  aguinaldoIncomeTax: number;
}
export interface UYBreakdown extends StandardCountryBreakdown<"UY"> {
  aguinaldoMode: UYAguinaldoMode;
  enteredGrossSalary: number;
  regularIrpfIncome: number;
  aguinaldo: number;
  socialContributionBase: number;
  aguinaldoMarginalRate: number;
}

declare module "../types" {
  interface CountryCodeMap {
    UY: true;
  }

  interface CurrencyCodeMap {
    UYU: true;
  }

  interface ContributionInputMap {
    UY: UYContributionInputs;
  }

  interface CalculatorInputMap {
    UY: UYCalculatorInputs;
  }

  interface TaxBreakdownMap {
    UY: UYTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    UY: UYBreakdown;
  }
}

export function isUYInputs(
  inputs: CalculatorInputs,
): inputs is UYCalculatorInputs {
  return inputs.country === "UY";
}

export function isUYTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is UYTaxBreakdown {
  return "type" in taxes && taxes.type === "UY";
}

export function isUYBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is UYBreakdown {
  return breakdown.type === "UY";
}
