import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { LT_CONFIG } from "./config";
import { LT_TAX_CONFIG } from "./constants/tax-year-2026";
import type {
  LTCalculatorInputs,
  LTDisabilityNpdType,
  LTSecondPillarRate,
} from "./types";

const baseCalculator = createStandardCountryCalculator(
  LT_CONFIG,
  LT_TAX_CONFIG,
);

function getLTDefaultInputs(): LTCalculatorInputs {
  return {
    country: "LT",
    grossSalary: LT_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    secondPillarRate: "0",
    disabilityNpdType: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      educationExpenses: 0,
    },
  };
}

function normalizeSecondPillarRate(rate: unknown): LTSecondPillarRate {
  return rate === "3" ? "3" : "0";
}

function normalizeDisabilityNpdType(type: unknown): LTDisabilityNpdType {
  return type === "participation_0_25" || type === "participation_30_55"
    ? type
    : "none";
}

function normalizeLTInputs(inputs: CalculatorInputs): LTCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"LT"> &
    Partial<LTCalculatorInputs>;
  const defaultInputs = getLTDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "LT",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    secondPillarRate: normalizeSecondPillarRate(standardInputs.secondPillarRate),
    disabilityNpdType: normalizeDisabilityNpdType(
      standardInputs.disabilityNpdType,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const LTCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "LT") {
      throw new Error("LTCalculator can only calculate Lithuania inputs");
    }

    return baseCalculator.calculate(normalizeLTInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getLTDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): LTCalculatorInputs {
    return getLTDefaultInputs();
  },
};
