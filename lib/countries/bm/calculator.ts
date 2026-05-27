import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { BM_CONFIG } from "./config";
import {
  BM_HEALTH_EMPLOYEE_HALF_STANDARD_PREMIUM_ANNUAL,
  BM_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type {
  BMCalculatorInputs,
  BMOccupationalPensionTreatment,
} from "./types";

const baseCalculator = createStandardCountryCalculator(
  BM_CONFIG,
  BM_TAX_CONFIG,
);

function normalizeOccupationalPensionTreatment(
  value: unknown,
): BMOccupationalPensionTreatment {
  return value === "notCovered" || value === "employerPaidEmployeeShare"
    ? value
    : "employeeDeducted";
}

function normalizeBMInputs(inputs: CalculatorInputs): BMCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"BM"> &
    Partial<BMCalculatorInputs>;

  return {
    ...standardInputs,
    country: "BM",
    grossSalary: standardInputs.grossSalary,
    taxableNonCashBenefits: Math.max(
      0,
      standardInputs.taxableNonCashBenefits ?? 0,
    ),
    payFrequency: standardInputs.payFrequency,
    payrollTaxDeducted: standardInputs.payrollTaxDeducted ?? true,
    socialInsuranceCovered: standardInputs.socialInsuranceCovered ?? true,
    occupationalPensionTreatment: normalizeOccupationalPensionTreatment(
      standardInputs.occupationalPensionTreatment,
    ),
    nonWorkingSpouseHealthCoverage:
      standardInputs.nonWorkingSpouseHealthCoverage ?? false,
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      insurancePremiums: standardInputs.contributions?.insurancePremiums ?? 0,
    },
  };
}

function getBMDefaultInputs(): BMCalculatorInputs {
  return {
    country: "BM",
    grossSalary: BM_TAX_CONFIG.defaultSalary,
    taxableNonCashBenefits: 0,
    payFrequency: "monthly",
    payrollTaxDeducted: true,
    socialInsuranceCovered: true,
    occupationalPensionTreatment: "employeeDeducted",
    nonWorkingSpouseHealthCoverage: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: BM_HEALTH_EMPLOYEE_HALF_STANDARD_PREMIUM_ANNUAL,
    },
  };
}

export const BMCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "BM") {
      throw new Error("BMCalculator can only calculate Bermuda inputs");
    }

    return baseCalculator.calculate(normalizeBMInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getBMDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeBMInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<BMCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): BMCalculatorInputs {
    return getBMDefaultInputs();
  },
};
