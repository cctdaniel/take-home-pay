import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { EE_CONFIG } from "./config";
import {
  EE_PENSIONABLE_AGE_BASIC_EXEMPTION,
  EE_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { EECalculatorInputs, EESecondPillarRate } from "./types";

const baseCalculator = createStandardCountryCalculator(
  EE_CONFIG,
  EE_TAX_CONFIG,
);

function getEEDefaultInputs(): EECalculatorInputs {
  return {
    country: "EE",
    grossSalary: EE_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    secondPillarRate: "2",
    isPensionableAge: false,
    pensionBasicExemptionUsedElsewhere: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeSecondPillarRate(rate: unknown): EESecondPillarRate {
  return rate === "0" || rate === "4" || rate === "6" ? rate : "2";
}

function normalizeEEInputs(inputs: CalculatorInputs): EECalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"EE"> &
    Partial<EECalculatorInputs>;
  const defaultInputs = getEEDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "EE",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    secondPillarRate: normalizeSecondPillarRate(standardInputs.secondPillarRate),
    isPensionableAge: standardInputs.isPensionableAge ?? false,
    pensionBasicExemptionUsedElsewhere: standardInputs.isPensionableAge
      ? Math.min(
          Math.max(0, standardInputs.pensionBasicExemptionUsedElsewhere ?? 0),
          EE_PENSIONABLE_AGE_BASIC_EXEMPTION,
        )
      : 0,
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const EECalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "EE") {
      throw new Error("EECalculator can only calculate Estonia inputs");
    }

    return baseCalculator.calculate(normalizeEEInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getEEDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): EECalculatorInputs {
    return getEEDefaultInputs();
  },
};
