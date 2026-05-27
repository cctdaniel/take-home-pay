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

export type ZAAgeBand = "under65" | "age65to74" | "age75plus";

export interface ZAContributionInputs
  extends StandardCountryContributionInputs {
  medicalExpenses: number;
  insurancePremiums: number;
  charitableDonations: number;
}

export interface ZACalculatorInputs
  extends Omit<StandardCountryCalculatorInputs<"ZA">, "contributions"> {
  ageBand: ZAAgeBand;
  medicalSchemeMembers: number;
  hasDisabilityInFamily: boolean;
  contributions: ZAContributionInputs;
}

export type ZATaxBreakdown = StandardCountryTaxBreakdown<"ZA">;
export type ZABreakdown = StandardCountryBreakdown<"ZA">;

declare module "../types" {
  interface CountryCodeMap {
    ZA: true;
  }

  interface CurrencyCodeMap {
    ZAR: true;
  }

  interface ContributionInputMap {
    ZA: ZAContributionInputs;
  }

  interface CalculatorInputMap {
    ZA: ZACalculatorInputs;
  }

  interface TaxBreakdownMap {
    ZA: ZATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    ZA: ZABreakdown;
  }
}

export function isZAInputs(
  inputs: CalculatorInputs,
): inputs is ZACalculatorInputs {
  return inputs.country === "ZA";
}

export function isZATaxBreakdown(
  taxes: TaxBreakdown,
): taxes is ZATaxBreakdown {
  return "type" in taxes && taxes.type === "ZA";
}

export function isZABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ZABreakdown {
  return breakdown.type === "ZA";
}
