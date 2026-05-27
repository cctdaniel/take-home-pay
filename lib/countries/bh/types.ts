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

export type BHWorkerType = "expatriate" | "bahraini";
export type BHContributionInputs = StandardCountryContributionInputs;
export interface BHCalculatorInputs extends StandardCountryCalculatorInputs<"BH"> {
  workerType: BHWorkerType;
  sioBasicWageMonthly: number;
  sioRecurringAllowancesMonthly: number;
  sioContributoryWageMonthly: number;
}
export type BHTaxBreakdown = StandardCountryTaxBreakdown<"BH">;
export interface BHBreakdown extends StandardCountryBreakdown<"BH"> {
  workerType: BHWorkerType;
  sioBasicWageMonthly: number;
  sioRecurringAllowancesMonthly: number;
  sioSelectedWageMonthly: number;
  sioContributoryWageMonthly: number;
  sioContributoryWageAnnual: number;
}

declare module "../types" {
  interface CountryCodeMap {
    BH: true;
  }

  interface CurrencyCodeMap {
    BHD: true;
  }

  interface ContributionInputMap {
    BH: BHContributionInputs;
  }

  interface CalculatorInputMap {
    BH: BHCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BH: BHTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BH: BHBreakdown;
  }
}

export function isBHInputs(
  inputs: CalculatorInputs,
): inputs is BHCalculatorInputs {
  return inputs.country === "BH";
}

export function isBHTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BHTaxBreakdown {
  return "type" in taxes && taxes.type === "BH";
}

export function isBHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BHBreakdown {
  return breakdown.type === "BH";
}
