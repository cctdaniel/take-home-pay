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

export interface ECContributionInputs extends StandardCountryContributionInputs {
  qualifyingExpenses: number;
}

export type ECIncomeExemptionType =
  | "none"
  | "olderAdult"
  | "disability30to49"
  | "disability50to74"
  | "disability75to84"
  | "disability85to100";

export interface ECCalculatorInputs extends StandardCountryCalculatorInputs<"EC"> {
  familyDependents: number;
  hasDisabilityOrCatastrophicIllness: boolean;
  incomeExemptionType: ECIncomeExemptionType;
  contributions: ECContributionInputs;
}
export type ECTaxBreakdown = StandardCountryTaxBreakdown<"EC">;
export interface ECBreakdown extends StandardCountryBreakdown<"EC"> {
  incomeExemptionType: ECIncomeExemptionType;
  incomeExemptionName: string;
  personalAllowanceName: string;
  personalExpenseBasketCount: number;
}

declare module "../types" {
  interface CountryCodeMap {
    EC: true;
  }

  interface CurrencyCodeMap {
    USD: true;
  }

  interface ContributionInputMap {
    EC: ECContributionInputs;
  }

  interface CalculatorInputMap {
    EC: ECCalculatorInputs;
  }

  interface TaxBreakdownMap {
    EC: ECTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    EC: ECBreakdown;
  }
}

export function isECInputs(
  inputs: CalculatorInputs,
): inputs is ECCalculatorInputs {
  return inputs.country === "EC";
}

export function isECTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is ECTaxBreakdown {
  return "type" in taxes && taxes.type === "EC";
}

export function isECBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ECBreakdown {
  return breakdown.type === "EC";
}
