import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { BB_CONFIG } from "./config";
import { BB_TAX_CONFIG } from "./constants/tax-year-2026";
import type { BBCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  BB_CONFIG,
  BB_TAX_CONFIG,
);

function getBBDefaultInputs(): BBCalculatorInputs {
  return {
    country: "BB",
    grossSalary: BB_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    residencyStatus: "resident",
    ageAllowanceStatus: "standard",
    hasEligibleSpouse: false,
    charityType: "registeredNonExempt",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
    },
  };
}

function normalizeBBInputs(inputs: CalculatorInputs): BBCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"BB"> &
    Partial<BBCalculatorInputs>;
  const defaultInputs = getBBDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "BB",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    residencyStatus: standardInputs.residencyStatus ?? "resident",
    ageAllowanceStatus: standardInputs.ageAllowanceStatus ?? "standard",
    hasEligibleSpouse: standardInputs.hasEligibleSpouse ?? false,
    charityType: standardInputs.charityType ?? "registeredNonExempt",
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const BBCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "BB") {
      throw new Error("BBCalculator can only calculate Barbados inputs");
    }

    return baseCalculator.calculate(normalizeBBInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getBBDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): BBCalculatorInputs {
    return getBBDefaultInputs();
  },
};
