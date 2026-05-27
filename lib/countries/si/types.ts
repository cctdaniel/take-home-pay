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

export type SIContributionInputs = StandardCountryContributionInputs;
export interface SICalculatorInputs
  extends StandardCountryCalculatorInputs<"SI"> {
  age: number;
  isResidentYoungWorker: boolean;
  isFullyDisabled: boolean;
  numberOfDependentChildren: number;
  numberOfSpecialCareChildren: number;
  numberOfOtherDependents: number;
  mealReimbursementWorkdays: number;
  transportReimbursementAnnual: number;
  holidayAllowance: number;
}
export type SITaxBreakdown = StandardCountryTaxBreakdown<"SI">;
export type SIBreakdown = StandardCountryBreakdown<"SI"> & {
  taxableSalary: number;
  taxExemptReimbursements: {
    meal: number;
    transport: number;
    holidayAllowance: number;
    total: number;
  };
};

declare module "../types" {
  interface CountryCodeMap {
    SI: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    SI: SIContributionInputs;
  }

  interface CalculatorInputMap {
    SI: SICalculatorInputs;
  }

  interface TaxBreakdownMap {
    SI: SITaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SI: SIBreakdown;
  }
}

export function isSIInputs(
  inputs: CalculatorInputs,
): inputs is SICalculatorInputs {
  return inputs.country === "SI";
}

export function isSITaxBreakdown(
  taxes: TaxBreakdown,
): taxes is SITaxBreakdown {
  return "type" in taxes && taxes.type === "SI";
}

export function isSIBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SIBreakdown {
  return breakdown.type === "SI";
}
