import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { AD_CONFIG } from "./config";
import { AD_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ADCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  AD_CONFIG,
  AD_TAX_CONFIG,
);

function normalizeADInputs(inputs: CalculatorInputs): ADCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"AD"> &
    Partial<ADCalculatorInputs>;
  const numberOfFamilyDependents = Math.max(
    0,
    Math.floor(standardInputs.numberOfFamilyDependents ?? 0),
  );

  return {
    ...standardInputs,
    country: "AD",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    hasNonWorkingSpouseOrPartner:
      standardInputs.hasNonWorkingSpouseOrPartner ?? false,
    isDisabledTaxpayer: standardInputs.isDisabledTaxpayer ?? false,
    numberOfFamilyDependents,
    numberOfDisabledDependents: Math.min(
      numberOfFamilyDependents,
      Math.max(0, Math.floor(standardInputs.numberOfDisabledDependents ?? 0)),
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      housingExpenses: standardInputs.contributions?.housingExpenses ?? 0,
    },
  };
}

function getADDefaultInputs(): ADCalculatorInputs {
  return {
    country: "AD",
    grossSalary: AD_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    hasNonWorkingSpouseOrPartner: false,
    isDisabledTaxpayer: false,
    numberOfFamilyDependents: 0,
    numberOfDisabledDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
    },
  };
}

export const ADCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "AD") {
      throw new Error("ADCalculator can only calculate Andorra inputs");
    }

    return baseCalculator.calculate(normalizeADInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getADDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeADInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<ADCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): ADCalculatorInputs {
    return getADDefaultInputs();
  },
};
