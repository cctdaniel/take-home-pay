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

export type SCCitizenship = "citizen" | "non_citizen";
export type SCEmployeeTaxTable =
  | "citizen"
  | "non_citizen"
  | "specific_project"
  | "stevedore";

export type SCContributionInputs = StandardCountryContributionInputs;
export interface SCCalculatorInputs
  extends StandardCountryCalculatorInputs<"SC"> {
  employeeTaxTable: SCEmployeeTaxTable;
  citizenship: SCCitizenship;
  taxableNonMonetaryBenefits: number;
}
export type SCTaxBreakdown = StandardCountryTaxBreakdown<"SC"> & {
  nonMonetaryBenefitsTax: number;
};
export type SCBreakdown = StandardCountryBreakdown<"SC"> & {
  employeeTaxTable: SCEmployeeTaxTable;
  citizenship: SCCitizenship;
  taxableNonMonetaryBenefits: number;
  nonMonetaryBenefitsTax: number;
  voluntarySpfContribution: number;
};

declare module "../types" {
  interface CountryCodeMap {
    SC: true;
  }

  interface CurrencyCodeMap {
    SCR: true;
  }

  interface ContributionInputMap {
    SC: SCContributionInputs;
  }

  interface CalculatorInputMap {
    SC: SCCalculatorInputs;
  }

  interface TaxBreakdownMap {
    SC: SCTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SC: SCBreakdown;
  }
}

export function isSCInputs(
  inputs: CalculatorInputs,
): inputs is SCCalculatorInputs {
  return inputs.country === "SC";
}

export function isSCTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is SCTaxBreakdown {
  return "type" in taxes && taxes.type === "SC";
}

export function isSCBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SCBreakdown {
  return breakdown.type === "SC";
}
