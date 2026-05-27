import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { MU_CONFIG } from "./config";
import { MU_TAX_CONFIG } from "./constants/tax-year-2026";
import type { MUCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  MU_CONFIG,
  MU_TAX_CONFIG,
);

function getMUDefaultInputs(): MUCalculatorInputs {
  return {
    country: "MU",
    grossSalary: MU_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfDependents: 0,
    numberOfPrivateSchoolDependents: 0,
    numberOfTertiaryEducationDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
      educationExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      carerWages: 0,
    },
  };
}

function normalizeMUInputs(inputs: CalculatorInputs): MUCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"MU"> &
    Partial<MUCalculatorInputs>;
  const defaultInputs = getMUDefaultInputs();
  const numberOfDependents = Math.min(
    Math.max(0, standardInputs.numberOfDependents ?? 0),
    4,
  );

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "MU",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    numberOfDependents,
    numberOfPrivateSchoolDependents: Math.min(
      Math.max(0, standardInputs.numberOfPrivateSchoolDependents ?? 0),
      numberOfDependents,
    ),
    numberOfTertiaryEducationDependents: Math.min(
      Math.max(0, standardInputs.numberOfTertiaryEducationDependents ?? 0),
      numberOfDependents,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const MUCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "MU") {
      throw new Error("MUCalculator can only calculate Mauritius inputs");
    }

    return baseCalculator.calculate(normalizeMUInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getMUDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): MUCalculatorInputs {
    return getMUDefaultInputs();
  },
};
