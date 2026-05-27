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

export type CLContractType = "indefinite" | "fixedTermOrWork";
export type CLApvTaxRegime = "regimeB" | "regimeA";

export interface CLContributionInputs extends StandardCountryContributionInputs {
  retirementContribution: number;
  medicalExpenses: number;
}

export interface CLCalculatorInputs extends StandardCountryCalculatorInputs<"CL"> {
  contractType: CLContractType;
  apvTaxRegime: CLApvTaxRegime;
  contributions: CLContributionInputs;
}
export type CLTaxBreakdown = StandardCountryTaxBreakdown<"CL">;
export interface CLBreakdown extends StandardCountryBreakdown<"CL"> {
  apvTaxRegime: CLApvTaxRegime;
  apvContribution: number;
  apvFiscalBonus: number;
  apvFiscalBonusCap: number;
}

declare module "../types" {
  interface CountryCodeMap {
    CL: true;
  }

  interface CurrencyCodeMap {
    CLP: true;
  }

  interface ContributionInputMap {
    CL: CLContributionInputs;
  }

  interface CalculatorInputMap {
    CL: CLCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CL: CLTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CL: CLBreakdown;
  }
}

export function isCLInputs(
  inputs: CalculatorInputs,
): inputs is CLCalculatorInputs {
  return inputs.country === "CL";
}

export function isCLTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is CLTaxBreakdown {
  return "type" in taxes && taxes.type === "CL";
}

export function isCLBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CLBreakdown {
  return breakdown.type === "CL";
}
