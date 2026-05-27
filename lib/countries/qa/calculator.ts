import {
  createStandardCountryCalculator,
  type StandardCountryBreakdown,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { QA_CONFIG } from "./config";
import {
  getQatarGRSIAContributionSalaryComponentsMonthly,
  getQatarGRSIAContributionSalaryMonthly,
  QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
  QA_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { QABreakdown, QACalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  QA_CONFIG,
  QA_TAX_CONFIG,
);

function normalizeQAInputs(inputs: CalculatorInputs): QACalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"QA"> &
    Partial<QACalculatorInputs>;

  return {
    ...standardInputs,
    country: "QA",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    employeeType: standardInputs.employeeType ?? "expatriate",
    contributionSalaryCapTreatment:
      standardInputs.contributionSalaryCapTreatment ?? "standardCap",
    grsiaBasicSalaryMonthly: Math.max(
      0,
      standardInputs.grsiaBasicSalaryMonthly ?? 0,
    ),
    grsiaSocialAllowanceMonthly: Math.max(
      0,
      standardInputs.grsiaSocialAllowanceMonthly ?? 0,
    ),
    grsiaHousingAllowanceMonthly: Math.max(
      0,
      standardInputs.grsiaHousingAllowanceMonthly ?? 0,
    ),
    grsiaContributionSalaryMonthly: Math.max(
      0,
      standardInputs.grsiaContributionSalaryMonthly ?? 0,
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function getQADefaultInputs(): QACalculatorInputs {
  return {
    country: "QA",
    grossSalary: QA_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    employeeType: "expatriate",
    contributionSalaryCapTreatment: "standardCap",
    grsiaBasicSalaryMonthly: 0,
    grsiaSocialAllowanceMonthly: 0,
    grsiaHousingAllowanceMonthly: 0,
    grsiaContributionSalaryMonthly: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

export const QACalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "QA") {
      throw new Error("QACalculator can only calculate Qatar inputs");
    }

    const normalizedInputs = normalizeQAInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const grsiaComponents = getQatarGRSIAContributionSalaryComponentsMonthly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const grsiaContributionSalaryMonthly =
      getQatarGRSIAContributionSalaryMonthly({
        grossSalary: result.grossSalary,
        inputs: normalizedInputs,
      });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"QA">),
      employeeType: normalizedInputs.employeeType,
      contributionSalaryCapTreatment:
        normalizedInputs.contributionSalaryCapTreatment,
      grsiaBasicSalaryMonthly: grsiaComponents.basicSalary,
      grsiaSocialAllowanceMonthly: grsiaComponents.socialAllowance,
      grsiaHousingAllowanceMonthly: grsiaComponents.housingAllowance,
      grsiaSelectedSalaryMonthly: grsiaComponents.selectedSalary,
      grsiaMonthlySalaryCap: grsiaComponents.salaryCap,
      grsiaMonthlyCapApplied: grsiaComponents.capApplied,
      grsiaHousingAllowanceMonthlyCap:
        QA_GRSIA_HOUSING_ALLOWANCE_MONTHLY_CAP,
      grsiaContributionSalaryMonthly,
      grsiaContributionSalaryAnnual: grsiaContributionSalaryMonthly * 12,
    } satisfies QABreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getQADefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeQAInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<QACalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): QACalculatorInputs {
    return getQADefaultInputs();
  },
};
