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

export interface CHContributionInputs
  extends StandardCountryContributionInputs {
  insurancePremiums: number;
  educationExpenses: number;
  carerWages: number;
  charitableDonations: number;
}

export interface CHCalculatorInputs
  extends StandardCountryCalculatorInputs<"CH"> {
  contributions: CHContributionInputs;
  numberOfChildren: number;
  numberOfChildcareChildren: number;
  numberOfSupportedPersons: number;
}
export type CHTaxBreakdown = StandardCountryTaxBreakdown<"CH">;
export type CHBreakdown = StandardCountryBreakdown<"CH">;

declare module "../types" {
  interface CountryCodeMap {
    CH: true;
  }

  interface CurrencyCodeMap {
    CHF: true;
  }

  interface ContributionInputMap {
    CH: CHContributionInputs;
  }

  interface CalculatorInputMap {
    CH: CHCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CH: CHTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CH: CHBreakdown;
  }
}

export function isCHInputs(
  inputs: CalculatorInputs,
): inputs is CHCalculatorInputs {
  return inputs.country === "CH";
}

export function isCHTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is CHTaxBreakdown {
  return "type" in taxes && taxes.type === "CH";
}

export function isCHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CHBreakdown {
  return breakdown.type === "CH";
}
