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

export interface ILContributionInputs extends StandardCountryContributionInputs {
  qualifyingExpenses: number;
  charitableDonations: number;
}

export interface ILCalculatorInputs
  extends StandardCountryCalculatorInputs<"IL"> {
  additionalCreditPoints: number;
  contributions: ILContributionInputs;
}
export type ILTaxBreakdown = StandardCountryTaxBreakdown<"IL">;
export interface ILBreakdown extends StandardCountryBreakdown<"IL"> {
  studyFundEmployeeContribution: number;
  studyFundEmployerContribution: number;
  studyFundSalaryBase: number;
}

declare module "../types" {
  interface CountryCodeMap {
    IL: true;
  }

  interface CurrencyCodeMap {
    ILS: true;
  }

  interface ContributionInputMap {
    IL: ILContributionInputs;
  }

  interface CalculatorInputMap {
    IL: ILCalculatorInputs;
  }

  interface TaxBreakdownMap {
    IL: ILTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    IL: ILBreakdown;
  }
}

export function isILInputs(
  inputs: CalculatorInputs,
): inputs is ILCalculatorInputs {
  return inputs.country === "IL";
}

export function isILTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is ILTaxBreakdown {
  return "type" in taxes && taxes.type === "IL";
}

export function isILBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ILBreakdown {
  return breakdown.type === "IL";
}
