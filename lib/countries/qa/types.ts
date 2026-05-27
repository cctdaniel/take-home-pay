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

export type QAEmployeeType = "expatriate" | "qatariPensionCovered";
export type QAContributionSalaryCapTreatment = "standardCap" | "grandfathered";
export type QAContributionInputs = StandardCountryContributionInputs;
export interface QACalculatorInputs
  extends StandardCountryCalculatorInputs<"QA"> {
  employeeType: QAEmployeeType;
  contributionSalaryCapTreatment: QAContributionSalaryCapTreatment;
  grsiaBasicSalaryMonthly: number;
  grsiaSocialAllowanceMonthly: number;
  grsiaHousingAllowanceMonthly: number;
  grsiaContributionSalaryMonthly: number;
}
export type QATaxBreakdown = StandardCountryTaxBreakdown<"QA">;
export interface QABreakdown extends StandardCountryBreakdown<"QA"> {
  employeeType: QAEmployeeType;
  contributionSalaryCapTreatment: QAContributionSalaryCapTreatment;
  grsiaBasicSalaryMonthly: number;
  grsiaSocialAllowanceMonthly: number;
  grsiaHousingAllowanceMonthly: number;
  grsiaSelectedSalaryMonthly: number;
  grsiaMonthlySalaryCap: number;
  grsiaMonthlyCapApplied: boolean;
  grsiaHousingAllowanceMonthlyCap: number;
  grsiaContributionSalaryMonthly: number;
  grsiaContributionSalaryAnnual: number;
}

declare module "../types" {
  interface CountryCodeMap {
    QA: true;
  }

  interface CurrencyCodeMap {
    QAR: true;
  }

  interface ContributionInputMap {
    QA: QAContributionInputs;
  }

  interface CalculatorInputMap {
    QA: QACalculatorInputs;
  }

  interface TaxBreakdownMap {
    QA: QATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    QA: QABreakdown;
  }
}

export function isQAInputs(
  inputs: CalculatorInputs,
): inputs is QACalculatorInputs {
  return inputs.country === "QA";
}

export function isQATaxBreakdown(
  taxes: TaxBreakdown,
): taxes is QATaxBreakdown {
  return "type" in taxes && taxes.type === "QA";
}

export function isQABreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is QABreakdown {
  return breakdown.type === "QA";
}
