import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { LV_CONFIG } from "./config";
import {
  LV_PENSIONER_NON_TAXABLE_MINIMUM,
  LV_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { LVCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  LV_CONFIG,
  LV_TAX_CONFIG,
);

function getLVDefaultInputs(): LVCalculatorInputs {
  return {
    country: "LV",
    grossSalary: LV_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfDependents: 0,
    isPensioner: false,
    pensionerAllowanceUsedElsewhere: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeLVInputs(inputs: CalculatorInputs): LVCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"LV"> &
    Partial<LVCalculatorInputs>;
  const defaultInputs = getLVDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "LV",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    numberOfDependents: Math.min(
      Math.max(0, standardInputs.numberOfDependents ?? 0),
      10,
    ),
    isPensioner: standardInputs.isPensioner ?? false,
    pensionerAllowanceUsedElsewhere: standardInputs.isPensioner
      ? Math.min(
          Math.max(0, standardInputs.pensionerAllowanceUsedElsewhere ?? 0),
          LV_PENSIONER_NON_TAXABLE_MINIMUM,
        )
      : 0,
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const LVCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "LV") {
      throw new Error("LVCalculator can only calculate Latvia inputs");
    }

    return baseCalculator.calculate(normalizeLVInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getLVDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): LVCalculatorInputs {
    return getLVDefaultInputs();
  },
};
