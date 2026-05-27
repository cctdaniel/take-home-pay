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

export interface KEContributionInputs
  extends StandardCountryContributionInputs {
  medicalExpenses: number;
  housingExpenses: number;
}

export interface KECalculatorInputs
  extends Omit<StandardCountryCalculatorInputs<"KE">, "contributions"> {
  hasDisabilityExemptionCertificate: boolean;
  taxableNonCashBenefits: number;
  contributions: KEContributionInputs;
}

export type KETaxBreakdown = StandardCountryTaxBreakdown<"KE"> & {
  cashIncomeTax: number;
  nonCashBenefitTaxEffect: number;
};
export type KEBreakdown = StandardCountryBreakdown<"KE"> & {
  cashSalary: number;
  cashTaxableIncome: number;
  taxableNonCashBenefits: number;
};

declare module "../types" {
  interface CountryCodeMap {
    KE: true;
  }

  interface CurrencyCodeMap {
    KES: true;
  }

  interface ContributionInputMap {
    KE: KEContributionInputs;
  }

  interface CalculatorInputMap {
    KE: KECalculatorInputs;
  }

  interface TaxBreakdownMap {
    KE: KETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    KE: KEBreakdown;
  }
}

export function isKEInputs(
  inputs: CalculatorInputs,
): inputs is KECalculatorInputs {
  return inputs.country === "KE";
}

export function isKETaxBreakdown(
  taxes: TaxBreakdown,
): taxes is KETaxBreakdown {
  return "type" in taxes && taxes.type === "KE";
}

export function isKEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KEBreakdown {
  return breakdown.type === "KE";
}
