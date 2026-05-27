import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { GT_CONFIG } from "./config";
import { GT_TAX_CONFIG } from "./constants/tax-year-2026";
import type { GTCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  GT_CONFIG,
  GT_TAX_CONFIG,
);

function getGTDefaultInputs(): GTCalculatorInputs {
  return {
    country: "GT",
    grossSalary: GT_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
    },
  };
}

function normalizeGTInputs(inputs: CalculatorInputs): GTCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"GT"> &
    Partial<GTCalculatorInputs>;
  const defaultInputs = getGTDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "GT",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const GTCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "GT") {
      throw new Error("GTCalculator can only calculate Guatemala inputs");
    }

    return baseCalculator.calculate(normalizeGTInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getGTDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): GTCalculatorInputs {
    return getGTDefaultInputs();
  },
};
