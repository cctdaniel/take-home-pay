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

export type BMOccupationalPensionTreatment =
  | "notCovered"
  | "employeeDeducted"
  | "employerPaidEmployeeShare";

export interface BMContributionInputs
  extends StandardCountryContributionInputs {
  insurancePremiums: number;
}
export interface BMCalculatorInputs
  extends StandardCountryCalculatorInputs<"BM"> {
  payrollTaxDeducted: boolean;
  socialInsuranceCovered: boolean;
  occupationalPensionTreatment: BMOccupationalPensionTreatment;
  nonWorkingSpouseHealthCoverage: boolean;
  contributions: BMContributionInputs;
}
export type BMTaxBreakdown = StandardCountryTaxBreakdown<"BM">;
export type BMBreakdown = StandardCountryBreakdown<"BM">;

declare module "../types" {
  interface CountryCodeMap {
    BM: true;
  }

  interface CurrencyCodeMap {
    BMD: true;
  }

  interface ContributionInputMap {
    BM: BMContributionInputs;
  }

  interface CalculatorInputMap {
    BM: BMCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BM: BMTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BM: BMBreakdown;
  }
}

export function isBMInputs(
  inputs: CalculatorInputs,
): inputs is BMCalculatorInputs {
  return inputs.country === "BM";
}

export function isBMTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is BMTaxBreakdown {
  return "type" in taxes && taxes.type === "BM";
}

export function isBMBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BMBreakdown {
  return breakdown.type === "BM";
}
