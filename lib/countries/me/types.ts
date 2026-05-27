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

export type MEIncomeScenario =
  | "montenegroPayroll"
  | "digitalNomadForeignSource";
export type MEMunicipalSurtaxRate =
  | "standard13"
  | "podgoricaCetinje15"
  | "budva10";
export type MEContributionInputs = StandardCountryContributionInputs;
export interface MECalculatorInputs
  extends StandardCountryCalculatorInputs<"ME"> {
  incomeScenario: MEIncomeScenario;
  municipalSurtaxRate: MEMunicipalSurtaxRate;
}
export type METaxBreakdown = StandardCountryTaxBreakdown<"ME">;
export interface MEBreakdown extends StandardCountryBreakdown<"ME"> {
  incomeScenario: MEIncomeScenario;
  municipalSurtaxRate: MEMunicipalSurtaxRate;
  municipalSurtaxName: string;
  municipalSurtaxRateValue: number;
  municipalSurtaxEmployerCostEstimate: number;
}

declare module "../types" {
  interface CountryCodeMap {
    ME: true;
  }

  interface CurrencyCodeMap {
    EUR: true;
  }

  interface ContributionInputMap {
    ME: MEContributionInputs;
  }

  interface CalculatorInputMap {
    ME: MECalculatorInputs;
  }

  interface TaxBreakdownMap {
    ME: METaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    ME: MEBreakdown;
  }
}

export function isMEInputs(
  inputs: CalculatorInputs,
): inputs is MECalculatorInputs {
  return inputs.country === "ME";
}

export function isMETaxBreakdown(
  taxes: TaxBreakdown,
): taxes is METaxBreakdown {
  return "type" in taxes && taxes.type === "ME";
}

export function isMEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MEBreakdown {
  return breakdown.type === "ME";
}
