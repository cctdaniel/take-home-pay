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

export interface PYContributionInputs extends StandardCountryContributionInputs {
  qualifyingExpenses: number;
}

export type PYAguinaldoMode =
  | "includedInGross"
  | "additionalToGross"
  | "none";

export interface PYCalculatorInputs extends StandardCountryCalculatorInputs<"PY"> {
  ipsCovered: boolean;
  aguinaldoMode: PYAguinaldoMode;
  contributions: PYContributionInputs;
}
export type PYTaxBreakdown = StandardCountryTaxBreakdown<"PY">;
export interface PYBreakdown extends StandardCountryBreakdown<"PY"> {
  aguinaldoMode: PYAguinaldoMode;
  enteredGrossSalary: number;
  ordinarySalary: number;
  aguinaldo: number;
  taxableAndIpsSalaryBase: number;
}

declare module "../types" {
  interface CountryCodeMap {
    PY: true;
  }

  interface CurrencyCodeMap {
    PYG: true;
  }

  interface ContributionInputMap {
    PY: PYContributionInputs;
  }

  interface CalculatorInputMap {
    PY: PYCalculatorInputs;
  }

  interface TaxBreakdownMap {
    PY: PYTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PY: PYBreakdown;
  }
}

export function isPYInputs(
  inputs: CalculatorInputs,
): inputs is PYCalculatorInputs {
  return inputs.country === "PY";
}

export function isPYTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is PYTaxBreakdown {
  return "type" in taxes && taxes.type === "PY";
}

export function isPYBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PYBreakdown {
  return breakdown.type === "PY";
}
