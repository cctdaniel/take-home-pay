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

export type KWWorkerType = "expatriate" | "kuwaiti";
export type KWSector = "government" | "privateOil";
export type KWContributionInputs = StandardCountryContributionInputs;
export interface KWCalculatorInputs extends StandardCountryCalculatorInputs<"KW"> {
  workerType: KWWorkerType;
  sector: KWSector;
  pifssInsurableSalaryMonthly: number;
  pifssBasicSalaryMonthly: number;
  pifssSupplementarySalaryMonthly: number;
  includeFinancialRemuneration: boolean;
}
export type KWTaxBreakdown = StandardCountryTaxBreakdown<"KW">;
export interface KWBreakdown extends StandardCountryBreakdown<"KW"> {
  workerType: KWWorkerType;
  sector: KWSector;
  pifssInsurableSalaryMonthly: number;
  pifssInsurableSalaryAnnual: number;
  pifssBasicSalaryMonthly: number;
  pifssSupplementarySalaryMonthly: number;
  pifssPensionIncreaseSalaryMonthly: number;
  includeFinancialRemuneration: boolean;
}

declare module "../types" {
  interface CountryCodeMap {
    KW: true;
  }

  interface CurrencyCodeMap {
    KWD: true;
  }

  interface ContributionInputMap {
    KW: KWContributionInputs;
  }

  interface CalculatorInputMap {
    KW: KWCalculatorInputs;
  }

  interface TaxBreakdownMap {
    KW: KWTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    KW: KWBreakdown;
  }
}

export function isKWInputs(
  inputs: CalculatorInputs,
): inputs is KWCalculatorInputs {
  return inputs.country === "KW";
}

export function isKWTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is KWTaxBreakdown {
  return "type" in taxes && taxes.type === "KW";
}

export function isKWBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KWBreakdown {
  return breakdown.type === "KW";
}
