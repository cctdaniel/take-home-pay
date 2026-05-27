import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { PA_CONFIG } from "./config";
import { PA_TAX_CONFIG } from "./constants/tax-year-2026";
import type { PACalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  PA_CONFIG,
  PA_TAX_CONFIG,
);

function getPADefaultInputs(): PACalculatorInputs {
  return {
    country: "PA",
    grossSalary: PA_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    isMarried: false,
    educationStudents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      educationExpenses: 0,
      medicalExpenses: 0,
      charitableDonations: 0,
    },
  };
}

function normalizePAInputs(inputs: CalculatorInputs): PACalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"PA"> &
    Partial<PACalculatorInputs>;
  const defaultInputs = getPADefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "PA",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    isMarried: standardInputs.isMarried ?? false,
    educationStudents: Math.min(
      Math.max(0, standardInputs.educationStudents ?? 0),
      10,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const PACalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "PA") {
      throw new Error("PACalculator can only calculate Panama inputs");
    }

    return baseCalculator.calculate(normalizePAInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getPADefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): PACalculatorInputs {
    return getPADefaultInputs();
  },
};
