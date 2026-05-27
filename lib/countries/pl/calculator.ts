import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { PL_CONFIG } from "./config";
import { PL_TAX_CONFIG } from "./constants/tax-year-2026";
import type { PLCalculatorInputs, PLPitZeroRelief, PLPpkRate } from "./types";

const baseCalculator = createStandardCountryCalculator(
  PL_CONFIG,
  PL_TAX_CONFIG,
);

function getPLDefaultInputs(): PLCalculatorInputs {
  return {
    country: "PL",
    grossSalary: PL_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfChildren: 0,
    ppkRate: "0",
    pitZeroRelief: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
    },
  };
}

function normalizePpkRate(rate: unknown): PLPpkRate {
  return rate === "2" || rate === "3" || rate === "4" ? rate : "0";
}

function normalizePitZeroRelief(relief: unknown): PLPitZeroRelief {
  switch (relief) {
    case "youth_under_26":
    case "return_relief":
    case "family_4plus":
    case "working_senior":
      return relief;
    default:
      return "none";
  }
}

function normalizePLInputs(inputs: CalculatorInputs): PLCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"PL"> &
    Partial<PLCalculatorInputs>;
  const defaultInputs = getPLDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "PL",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    numberOfChildren: Math.min(
      Math.max(0, standardInputs.numberOfChildren ?? 0),
      10,
    ),
    ppkRate: normalizePpkRate(standardInputs.ppkRate),
    pitZeroRelief: normalizePitZeroRelief(standardInputs.pitZeroRelief),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const PLCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "PL") {
      throw new Error("PLCalculator can only calculate Poland inputs");
    }

    return baseCalculator.calculate(normalizePLInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getPLDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): PLCalculatorInputs {
    return getPLDefaultInputs();
  },
};
