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

export type PESalaryPackageMode =
  | "includedInGross"
  | "additionalToGross"
  | "none";
export type PEGratificationHealthCoverage = "essalud" | "eps";
export type PEPensionSystem =
  | "onp"
  | "afpHabitat"
  | "afpIntegra"
  | "afpPrima"
  | "afpProfuturo";
export type PEAfpCommissionMode = "flow" | "balance";

export interface PEContributionInputs extends StandardCountryContributionInputs {
  qualifyingExpenses: number;
}

export interface PECalculatorInputs extends StandardCountryCalculatorInputs<"PE"> {
  salaryPackageMode: PESalaryPackageMode;
  gratificationHealthCoverage: PEGratificationHealthCoverage;
  pensionSystem: PEPensionSystem;
  afpCommissionMode: PEAfpCommissionMode;
  contributions: PEContributionInputs;
}
export type PETaxBreakdown = StandardCountryTaxBreakdown<"PE">;
export interface PEBreakdown extends StandardCountryBreakdown<"PE"> {
  salaryPackageMode: PESalaryPackageMode;
  gratificationHealthCoverage: PEGratificationHealthCoverage;
  pensionSystem: PEPensionSystem;
  afpCommissionMode: PEAfpCommissionMode;
  pensionSystemName: string;
  afpBalanceCommissionRate: number;
  enteredGrossSalary: number;
  regularRemuneration: number;
  statutoryGratifications: number;
  extraordinaryGratificationBonus: number;
  pensionableRemuneration: number;
  afpInsuranceBase: number;
  afpInsuranceCap: number;
}

declare module "../types" {
  interface CountryCodeMap {
    PE: true;
  }

  interface CurrencyCodeMap {
    PEN: true;
  }

  interface ContributionInputMap {
    PE: PEContributionInputs;
  }

  interface CalculatorInputMap {
    PE: PECalculatorInputs;
  }

  interface TaxBreakdownMap {
    PE: PETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PE: PEBreakdown;
  }
}

export function isPEInputs(
  inputs: CalculatorInputs,
): inputs is PECalculatorInputs {
  return inputs.country === "PE";
}

export function isPETaxBreakdown(
  taxes: TaxBreakdown,
): taxes is PETaxBreakdown {
  return "type" in taxes && taxes.type === "PE";
}

export function isPEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PEBreakdown {
  return breakdown.type === "PE";
}
