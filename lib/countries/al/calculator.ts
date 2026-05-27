import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { AL_CONFIG } from "./config";
import {
  AL_DEPENDENT_CHILD_DEDUCTION,
  calculateALMonthlySocialInsuranceBase,
  AL_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { ALBreakdown, ALCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  AL_CONFIG,
  AL_TAX_CONFIG,
);

function normalizeALInputs(inputs: CalculatorInputs): ALCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"AL"> &
    Partial<ALCalculatorInputs>;

  return {
    ...standardInputs,
    country: "AL",
    grossSalary: standardInputs.grossSalary,
    taxableNonCashBenefits: Math.max(
      0,
      standardInputs.taxableNonCashBenefits ?? 0,
    ),
    payFrequency: standardInputs.payFrequency,
    appliesEmploymentAllowance:
      standardInputs.appliesEmploymentAllowance ?? true,
    claimsFamilyDivaDeductions:
      standardInputs.claimsFamilyDivaDeductions ?? true,
    numberOfDependentChildren: Math.max(
      0,
      Math.min(10, Math.floor(standardInputs.numberOfDependentChildren ?? 0)),
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      educationExpenses: standardInputs.contributions?.educationExpenses ?? 0,
    },
  };
}

function getALDefaultInputs(): ALCalculatorInputs {
  return {
    country: "AL",
    grossSalary: AL_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    taxableNonCashBenefits: 0,
    appliesEmploymentAllowance: true,
    claimsFamilyDivaDeductions: true,
    numberOfDependentChildren: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
    },
  };
}

export const ALCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "AL") {
      throw new Error("ALCalculator can only calculate Albania inputs");
    }

    const normalizedInputs = normalizeALInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const contributionLimits = baseCalculator.getContributionLimits({
      ...normalizedInputs,
      grossSalary:
        normalizedInputs.grossSalary + normalizedInputs.taxableNonCashBenefits,
    });
    const educationExpenseLimit =
      contributionLimits.educationExpenses?.limit ?? 0;
    const dependentChildDeduction =
      normalizedInputs.claimsFamilyDivaDeductions === false
        ? 0
        : normalizedInputs.numberOfDependentChildren *
          AL_DEPENDENT_CHILD_DEDUCTION;

    return {
      ...result,
      breakdown: {
        ...(result.breakdown as ALBreakdown),
        appliesEmploymentAllowance: normalizedInputs.appliesEmploymentAllowance,
        claimsFamilyDivaDeductions:
          normalizedInputs.claimsFamilyDivaDeductions,
        numberOfDependentChildren: normalizedInputs.numberOfDependentChildren,
        dependentChildDeduction,
        educationExpenseLimit,
        monthlySocialInsuranceBase: calculateALMonthlySocialInsuranceBase(
          Math.max(
            0,
            normalizedInputs.grossSalary +
              normalizedInputs.taxableNonCashBenefits,
          ),
        ),
      } satisfies ALBreakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getALDefaultInputs();

    const normalizedInputs = normalizeALInputs({
      ...defaultInputs,
      ...inputs,
      contributions: {
        ...defaultInputs.contributions,
        ...(inputs as Partial<ALCalculatorInputs>)?.contributions,
      },
    } as CalculatorInputs);

    return baseCalculator.getContributionLimits({
      ...normalizedInputs,
      grossSalary:
        normalizedInputs.grossSalary + normalizedInputs.taxableNonCashBenefits,
    });
  },

  getDefaultInputs(): ALCalculatorInputs {
    return getALDefaultInputs();
  },
};
