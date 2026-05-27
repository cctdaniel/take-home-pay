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

export type BZSocialSecurityStatus =
  | "standard"
  | "age60to64ReceivingBenefit"
  | "age65Plus";

export interface BZContributionInputs extends StandardCountryContributionInputs {
  charitableDonations: number;
  educationExpenses: number;
  qualifyingExpenses: number;
}

export interface BZCalculatorInputs extends StandardCountryCalculatorInputs<"BZ"> {
  socialSecurityStatus: BZSocialSecurityStatus;
  ssbWeeklyInsurableEarnings: number;
  educationReliefChildren: number;
  contributions: BZContributionInputs;
}
export type BZTaxBreakdown = StandardCountryTaxBreakdown<"BZ">;
export interface BZBreakdown extends StandardCountryBreakdown<"BZ"> {
  socialSecurityStatus: BZSocialSecurityStatus;
  ssbWeeklyInsurableEarnings: number;
  ssbEmployeeWeeklyContribution: number;
  ssbEmployeeAnnualContribution: number;
  ssbEmployerOnlyAnnualContribution: number;
  educationReliefChildren: number;
}

declare module "../types" {
  interface CountryCodeMap {
    BZ: true;
  }

  interface CurrencyCodeMap {
    BZD: true;
  }

  interface ContributionInputMap {
    BZ: BZContributionInputs;
  }

  interface CalculatorInputMap {
    BZ: BZCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BZ: BZTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BZ: BZBreakdown;
  }
}

export function isBZInputs(
  inputs: CalculatorInputs,
): inputs is BZCalculatorInputs {
  return inputs.country === "BZ";
}

export function isBZTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BZTaxBreakdown {
  return "type" in taxes && taxes.type === "BZ";
}

export function isBZBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BZBreakdown {
  return breakdown.type === "BZ";
}
