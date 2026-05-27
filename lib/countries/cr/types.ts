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

export type CRAguinaldoMode = "includedInGross" | "additionalToGross" | "none";

export type CRContributionInputs = StandardCountryContributionInputs;
export interface CRCalculatorInputs extends StandardCountryCalculatorInputs<"CR"> {
  hasEligibleSpouse: boolean;
  numberOfChildren: number;
  aguinaldoMode: CRAguinaldoMode;
}
export type CRTaxBreakdown = StandardCountryTaxBreakdown<"CR">;
export interface CRBreakdown extends StandardCountryBreakdown<"CR"> {
  aguinaldoMode: CRAguinaldoMode;
  enteredGrossSalary: number;
  regularTaxableSalary: number;
  aguinaldo: number;
  totalCashGross: number;
}

declare module "../types" {
  interface CountryCodeMap {
    CR: true;
  }

  interface CurrencyCodeMap {
    CRC: true;
  }

  interface ContributionInputMap {
    CR: CRContributionInputs;
  }

  interface CalculatorInputMap {
    CR: CRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CR: CRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CR: CRBreakdown;
  }
}

export function isCRInputs(
  inputs: CalculatorInputs,
): inputs is CRCalculatorInputs {
  return inputs.country === "CR";
}

export function isCRTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is CRTaxBreakdown {
  return "type" in taxes && taxes.type === "CR";
}

export function isCRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CRBreakdown {
  return breakdown.type === "CR";
}
