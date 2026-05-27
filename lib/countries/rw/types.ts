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

export type RWPensionCoverage = "employee" | "voluntaryMember";
export type RWContributionInputs = StandardCountryContributionInputs;
export interface RWCalculatorInputs
  extends StandardCountryCalculatorInputs<"RW"> {
  pensionCoverage: RWPensionCoverage;
  rssbMedicalSchemeCovered: boolean;
  rssbContributionSalaryMonthly: number;
  rssbMedicalBasicSalaryMonthly: number;
  hasHousingBenefit: boolean;
  hasMotorVehicleBenefit: boolean;
  otherTaxableBenefitsInKind: number;
}
export type RWTaxBreakdown = StandardCountryTaxBreakdown<"RW"> & {
  cashIncomeTax: number;
  benefitsInKindTaxEffect: number;
};
export type RWBreakdown = StandardCountryBreakdown<"RW"> & {
  cashSalary: number;
  cashTaxableIncome: number;
  taxableBenefitsInKind: {
    housing: number;
    motorVehicle: number;
    other: number;
    total: number;
  };
  rssbContributionSalaryMonthly: number;
  rssbMedicalBasicSalaryMonthly: number;
};

declare module "../types" {
  interface CountryCodeMap {
    RW: true;
  }

  interface CurrencyCodeMap {
    RWF: true;
  }

  interface ContributionInputMap {
    RW: RWContributionInputs;
  }

  interface CalculatorInputMap {
    RW: RWCalculatorInputs;
  }

  interface TaxBreakdownMap {
    RW: RWTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    RW: RWBreakdown;
  }
}

export function isRWInputs(
  inputs: CalculatorInputs,
): inputs is RWCalculatorInputs {
  return inputs.country === "RW";
}

export function isRWTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is RWTaxBreakdown {
  return "type" in taxes && taxes.type === "RW";
}

export function isRWBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is RWBreakdown {
  return breakdown.type === "RW";
}
