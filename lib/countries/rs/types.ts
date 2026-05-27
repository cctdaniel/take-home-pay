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

export type RSContributionInputs = StandardCountryContributionInputs;
export type RSNewlySettledRelief =
  | "none"
  | "prior_nonresident"
  | "under40_education";

export interface RSCalculatorInputs
  extends StandardCountryCalculatorInputs<"RS"> {
  taxableFringeBenefits: number;
  includeAnnualPersonalIncomeTax: boolean;
  newlySettledRelief: RSNewlySettledRelief;
  age: number;
  numberOfDependents: number;
}
export type RSTaxBreakdown = StandardCountryTaxBreakdown<"RS">;
export interface RSBreakdown extends StandardCountryBreakdown<"RS"> {
  annualPitDetails: {
    netAnnualEmploymentIncome: number;
    under40Reduction: number;
    annualPitThreshold: number;
    incomeForAnnualTax: number;
    taxpayerDeduction: number;
    dependentDeduction: number;
    personalDeductions: number;
    annualTaxBase: number;
    annualTaxBeforeCredit: number;
    alternativeInvestmentFundInvestment: number;
    alternativeInvestmentFundCredit: number;
    annualTax: number;
  };
  annualPitInputs: {
    includeAnnualPersonalIncomeTax: boolean;
    age: number;
    numberOfDependents: number;
    alternativeInvestmentFundInvestment: number;
  };
  newlySettledReliefInput: RSNewlySettledRelief;
}

declare module "../types" {
  interface CountryCodeMap {
    RS: true;
  }

  interface CurrencyCodeMap {
    RSD: true;
  }

  interface ContributionInputMap {
    RS: RSContributionInputs;
  }

  interface CalculatorInputMap {
    RS: RSCalculatorInputs;
  }

  interface TaxBreakdownMap {
    RS: RSTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    RS: RSBreakdown;
  }
}

export function isRSInputs(
  inputs: CalculatorInputs,
): inputs is RSCalculatorInputs {
  return inputs.country === "RS";
}

export function isRSTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is RSTaxBreakdown {
  return "type" in taxes && taxes.type === "RS";
}

export function isRSBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is RSBreakdown {
  return breakdown.type === "RS";
}
