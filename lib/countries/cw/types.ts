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

export type CWTaxResidencyType = "resident" | "foreign_taxpayer";

export type CWContributionInputs = StandardCountryContributionInputs;
export interface CWCalculatorInputs extends StandardCountryCalculatorInputs<"CW"> {
  taxResidency: CWTaxResidencyType;
  isMarriedSingleEarner: boolean;
  isAge60OrOlder: boolean;
  hasTransferredElderlyAllowance: boolean;
  childAllowanceCategoryI: number;
  childAllowanceCategoryII: number;
  childAllowanceCategoryIII: number;
  childAllowanceCategoryIV: number;
}
export type CWTaxBreakdown = StandardCountryTaxBreakdown<"CW">;
export type CWBreakdown = StandardCountryBreakdown<"CW">;

declare module "../types" {
  interface CountryCodeMap {
    CW: true;
  }

  interface CurrencyCodeMap {
    ANG: true;
  }

  interface ContributionInputMap {
    CW: CWContributionInputs;
  }

  interface CalculatorInputMap {
    CW: CWCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CW: CWTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CW: CWBreakdown;
  }
}

export function isCWInputs(
  inputs: CalculatorInputs,
): inputs is CWCalculatorInputs {
  return inputs.country === "CW";
}

export function isCWTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is CWTaxBreakdown {
  return "type" in taxes && taxes.type === "CW";
}

export function isCWBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CWBreakdown {
  return breakdown.type === "CW";
}
