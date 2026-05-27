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

export type KHContributionInputs = StandardCountryContributionInputs;
export type KHTaxResidency = "resident" | "nonResident";
export interface KHCalculatorInputs
  extends StandardCountryCalculatorInputs<"KH"> {
  taxResidency: KHTaxResidency;
  hasDependentSpouse: boolean;
  dependentChildren: number;
  taxableFringeBenefits: number;
  nssfMonthlyWage: number;
}
export type KHTaxBreakdown = StandardCountryTaxBreakdown<"KH"> & {
  fringeBenefitTax: number;
};
export type KHBreakdown = StandardCountryBreakdown<"KH"> & {
  taxResidency: KHTaxResidency;
  cashSalary: number;
  taxableFringeBenefits: number;
  fringeBenefitTax: number;
  nssfMonthlyWage: number;
  nssfHealthCareBaseMonthly: number;
  nssfPensionBaseMonthly: number;
};

declare module "../types" {
  interface CountryCodeMap {
    KH: true;
  }

  interface CurrencyCodeMap {
    KHR: true;
  }

  interface ContributionInputMap {
    KH: KHContributionInputs;
  }

  interface CalculatorInputMap {
    KH: KHCalculatorInputs;
  }

  interface TaxBreakdownMap {
    KH: KHTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    KH: KHBreakdown;
  }
}

export function isKHInputs(
  inputs: CalculatorInputs,
): inputs is KHCalculatorInputs {
  return inputs.country === "KH";
}

export function isKHTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is KHTaxBreakdown {
  return "type" in taxes && taxes.type === "KH";
}

export function isKHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KHBreakdown {
  return breakdown.type === "KH";
}
