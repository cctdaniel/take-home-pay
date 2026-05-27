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

export interface ROContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  insurancePremiums: number;
  unionFees: number;
  sportsSubscriptions: number;
  investmentSubscriptions: number;
}

export interface ROCalculatorInputs extends StandardCountryCalculatorInputs<"RO"> {
  claimPersonalDeduction: boolean;
  dependentCount: number;
  ageUnder26: boolean;
  schoolChildren: number;
  contributions: ROContributionInputs;
}
export type ROTaxBreakdown = StandardCountryTaxBreakdown<"RO">;
export interface ROBreakdown extends StandardCountryBreakdown<"RO"> {
  personalDeductionDetails: {
    basicPersonalDeduction: number;
    youngEmployeeDeduction: number;
    schoolChildDeduction: number;
    total: number;
  };
  personalDeductionInputs: {
    claimPersonalDeduction: boolean;
    dependentCount: number;
    ageUnder26: boolean;
    schoolChildren: number;
  };
}

declare module "../types" {
  interface CountryCodeMap {
    RO: true;
  }

  interface CurrencyCodeMap {
    RON: true;
  }

  interface ContributionInputMap {
    RO: ROContributionInputs;
  }

  interface CalculatorInputMap {
    RO: ROCalculatorInputs;
  }

  interface TaxBreakdownMap {
    RO: ROTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    RO: ROBreakdown;
  }
}

export function isROInputs(
  inputs: CalculatorInputs,
): inputs is ROCalculatorInputs {
  return inputs.country === "RO";
}

export function isROTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is ROTaxBreakdown {
  return "type" in taxes && taxes.type === "RO";
}

export function isROBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ROBreakdown {
  return breakdown.type === "RO";
}
