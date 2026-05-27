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

export type SAWorkerType =
  | "expatriate"
  | "saudi_standard"
  | "saudi_new_system_2026";
export type SAHousingAllowanceType = "none" | "cash" | "inKind";
export type SAContributionInputs = StandardCountryContributionInputs;
export interface SACalculatorInputs extends StandardCountryCalculatorInputs<"SA"> {
  workerType: SAWorkerType;
  gosiBasicWageMonthly: number;
  housingAllowanceType: SAHousingAllowanceType;
  cashHousingAllowanceMonthly: number;
  gosiContributoryWageMonthly: number;
}
export type SATaxBreakdown = StandardCountryTaxBreakdown<"SA">;
export interface SABreakdown extends StandardCountryBreakdown<"SA"> {
  workerType: SAWorkerType;
  gosiBasicWageMonthly: number;
  housingAllowanceType: SAHousingAllowanceType;
  cashHousingAllowanceMonthly: number;
  gosiHousingValueMonthly: number;
  gosiContributoryWageMonthly: number;
  gosiContributoryWageAnnual: number;
}

declare module "../types" {
  interface CountryCodeMap {
    SA: true;
  }

  interface CurrencyCodeMap {
    SAR: true;
  }

  interface ContributionInputMap {
    SA: SAContributionInputs;
  }

  interface CalculatorInputMap {
    SA: SACalculatorInputs;
  }

  interface TaxBreakdownMap {
    SA: SATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SA: SABreakdown;
  }
}

export function isSAInputs(
  inputs: CalculatorInputs,
): inputs is SACalculatorInputs {
  return inputs.country === "SA";
}

export function isSATaxBreakdown(
  taxes: TaxBreakdown,
): taxes is SATaxBreakdown {
  return "type" in taxes && taxes.type === "SA";
}

export function isSABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SABreakdown {
  return breakdown.type === "SA";
}
