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

export type BSNibCategory =
  | "standard"
  | "age65PlusNotRetired"
  | "age60to64RetirementBenefit"
  | "age65PlusRetirementBenefit"
  | "summerEmployment";

export type BSContributionInputs = StandardCountryContributionInputs;
export interface BSCalculatorInputs extends StandardCountryCalculatorInputs<"BS"> {
  nibCategory: BSNibCategory;
  nibInsurableWeeklyWage: number;
  weeklyFormalGratuities: number;
}

export type BSTaxBreakdown = StandardCountryTaxBreakdown<"BS">;
export interface BSBreakdown extends StandardCountryBreakdown<"BS"> {
  nibCategory: BSNibCategory;
  nibInsurableWeeklyWage: number;
  nibInsurableAnnualWage: number;
  weeklyFormalGratuities: number;
  annualFormalGratuities: number;
  nibBasicWageEmployeeRate: number;
  nibEmployerOnlyContributionAnnual: number;
}

declare module "../types" {
  interface CountryCodeMap {
    BS: true;
  }

  interface CurrencyCodeMap {
    BSD: true;
  }

  interface ContributionInputMap {
    BS: BSContributionInputs;
  }

  interface CalculatorInputMap {
    BS: BSCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BS: BSTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BS: BSBreakdown;
  }
}

export function isBSInputs(
  inputs: CalculatorInputs,
): inputs is BSCalculatorInputs {
  return inputs.country === "BS";
}

export function isBSTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BSTaxBreakdown {
  return "type" in taxes && taxes.type === "BS";
}

export function isBSBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BSBreakdown {
  return breakdown.type === "BS";
}
