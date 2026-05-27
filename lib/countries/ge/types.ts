import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export type GEResidencyType = "resident" | "non_resident";

export type GEIncomeRegime =
  | "employment"
  | "small_business"
  | "micro_business";

export type GEPensionParticipation =
  | "mandatory_or_enrolled"
  | "not_participating";

export type GESmallBusinessThresholdTreatment =
  | "even_monthly"
  | "three_percent_full_year";

export type GEContributionInputs = Record<never, never>;

export interface GECalculatorInputs extends BaseCalculatorInputs {
  country: "GE";
  incomeRegime: GEIncomeRegime;
  residencyType: GEResidencyType;
  pensionParticipation: GEPensionParticipation;
  smallBusinessThresholdTreatment: GESmallBusinessThresholdTreatment;
  contributions: GEContributionInputs;
}

export interface GETaxBreakdown extends BaseTaxBreakdown {
  type: "GE";
  incomeTax: number;
  pensionEmployee: number;
}

export interface GEBreakdown {
  type: "GE";
  grossIncome: number;
  taxableIncome: number;
  incomeRegime: GEIncomeRegime;
  residencyType: GEResidencyType;
  pensionParticipation: GEPensionParticipation;
  isPensionParticipant: boolean;
  incomeTax: {
    rate: number;
    taxableIncome: number;
    total: number;
  };
  businessRegime: {
    microBusinessIncomeLimit: number;
    microBusinessLimitExceeded: boolean;
    smallBusinessIncomeLimit: number;
    smallBusinessThresholdTreatment: GESmallBusinessThresholdTreatment;
    standardRateIncome: number;
    overLimitRateIncome: number;
    standardRate: number;
    overLimitRate: number;
    effectiveRate: number;
  };
  pension: {
    employee: number;
    employer: number;
    state: number;
    totalAccountContribution: number;
    employeeRate: number;
    employerRate: number;
    stateFirstBandLimit: number;
    stateSecondBandLimit: number;
    stateFirstBandRate: number;
    stateSecondBandRate: number;
    stateAboveSecondBandRate: number;
    stateContributionSalary: number;
    stateRate: number;
    stateFirstBandContributionSalary: number;
    stateSecondBandContributionSalary: number;
  };
  assumptions: {
    ordinaryEmploymentSalaryOnly: boolean;
    includesIndividualEntrepreneurRegimes: boolean;
  };
}

declare module "../types" {
  interface CountryCodeMap {
    GE: true;
  }

  interface CurrencyCodeMap {
    GEL: true;
  }

  interface ContributionInputMap {
    GE: GEContributionInputs;
  }

  interface CalculatorInputMap {
    GE: GECalculatorInputs;
  }

  interface TaxBreakdownMap {
    GE: GETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    GE: GEBreakdown;
  }
}

export function isGEInputs(
  inputs: CalculatorInputs,
): inputs is GECalculatorInputs {
  return inputs.country === "GE";
}

export function isGETaxBreakdown(taxes: TaxBreakdown): taxes is GETaxBreakdown {
  return "type" in taxes && taxes.type === "GE";
}

export function isGEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is GEBreakdown {
  return breakdown.type === "GE";
}
