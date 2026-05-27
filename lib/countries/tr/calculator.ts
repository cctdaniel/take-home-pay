import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { TR_CONFIG } from "./config";
import { TR_TAX_CONFIG } from "./constants/tax-year-2026";
import type {
  TRCalculatorInputs,
  TRDisabilityDegree,
  TRDonationReliefCategory,
} from "./types";

const baseCalculator = createStandardCountryCalculator(
  TR_CONFIG,
  TR_TAX_CONFIG,
);

function getTRDefaultInputs(): TRCalculatorInputs {
  return {
    country: "TR",
    grossSalary: TR_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    disabilityDegree: "none",
    donationReliefCategory: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
    },
  };
}

function normalizeDisabilityDegree(degree: unknown): TRDisabilityDegree {
  return degree === "first" || degree === "second" || degree === "third"
    ? degree
    : "none";
}

function normalizeDonationReliefCategory(
  category: unknown,
): TRDonationReliefCategory {
  return category === "generalPublicBenefit" ||
    category === "fullEducationHealth"
    ? category
    : "none";
}

function normalizeTRInputs(inputs: CalculatorInputs): TRCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"TR"> &
    Partial<TRCalculatorInputs>;
  const defaultInputs = getTRDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "TR",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    disabilityDegree: normalizeDisabilityDegree(standardInputs.disabilityDegree),
    donationReliefCategory: normalizeDonationReliefCategory(
      standardInputs.donationReliefCategory,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const TRCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "TR") {
      throw new Error("TRCalculator can only calculate Turkey inputs");
    }

    return baseCalculator.calculate(normalizeTRInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getTRDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): TRCalculatorInputs {
    return getTRDefaultInputs();
  },
};
