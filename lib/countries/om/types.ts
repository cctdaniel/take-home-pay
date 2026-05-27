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

export type OMWorkerType = "expatriate" | "omani";
export type OMContributionInputs = StandardCountryContributionInputs;
export interface OMCalculatorInputs extends StandardCountryCalculatorInputs<"OM"> {
  workerType: OMWorkerType;
  spfInsuredWageMonthly: number;
  expatProvidentSchemeApplied: boolean;
  expatProvidentBasicWageMonthly: number;
}
export type OMTaxBreakdown = StandardCountryTaxBreakdown<"OM">;
export interface OMBreakdown extends StandardCountryBreakdown<"OM"> {
  workerType: OMWorkerType;
  spfInsuredWageMonthly: number;
  spfInsuredWageAnnual: number;
  expatProvidentSchemeApplied: boolean;
  expatProvidentBasicWageMonthly: number;
  expatProvidentEmployerContributionAnnual: number;
}

declare module "../types" {
  interface CountryCodeMap {
    OM: true;
  }

  interface CurrencyCodeMap {
    OMR: true;
  }

  interface ContributionInputMap {
    OM: OMContributionInputs;
  }

  interface CalculatorInputMap {
    OM: OMCalculatorInputs;
  }

  interface TaxBreakdownMap {
    OM: OMTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    OM: OMBreakdown;
  }
}

export function isOMInputs(
  inputs: CalculatorInputs,
): inputs is OMCalculatorInputs {
  return inputs.country === "OM";
}

export function isOMTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is OMTaxBreakdown {
  return "type" in taxes && taxes.type === "OM";
}

export function isOMBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is OMBreakdown {
  return breakdown.type === "OM";
}
