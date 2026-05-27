import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { BG_CONFIG } from "./config";
import { BG_TAX_CONFIG } from "./constants/tax-year-2026";
import type { BGCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  BG_CONFIG,
  BG_TAX_CONFIG,
);

function getBGDefaultInputs(): BGCalculatorInputs {
  return {
    country: "BG",
    grossSalary: BG_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfChildren: 0,
    numberOfDisabledChildren: 0,
    hasReducedWorkingCapacity: false,
    donationReliefCategory: "general_5",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
    },
  };
}

function normalizeBGInputs(inputs: CalculatorInputs): BGCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"BG"> &
    Partial<BGCalculatorInputs>;
  const defaultInputs = getBGDefaultInputs();
  const numberOfChildren = Math.min(
    Math.max(0, standardInputs.numberOfChildren ?? 0),
    10,
  );

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "BG",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    numberOfChildren,
    numberOfDisabledChildren: Math.min(
      Math.max(0, standardInputs.numberOfDisabledChildren ?? 0),
      numberOfChildren,
    ),
    hasReducedWorkingCapacity: standardInputs.hasReducedWorkingCapacity ?? false,
    donationReliefCategory:
      standardInputs.donationReliefCategory ?? "general_5",
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const BGCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "BG") {
      throw new Error("BGCalculator can only calculate Bulgaria inputs");
    }

    return baseCalculator.calculate(normalizeBGInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getBGDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): BGCalculatorInputs {
    return getBGDefaultInputs();
  },
};
