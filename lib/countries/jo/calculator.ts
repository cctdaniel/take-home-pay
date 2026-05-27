import {
  createStandardCountryCalculator,
  type StandardCountryBreakdown,
} from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { JO_CONFIG } from "./config";
import {
  getJordanSscMonthlyWage,
  JO_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { JOBreakdown, JOCalculatorInputs } from "./types";

const baseJOCalculator = createStandardCountryCalculator(
  JO_CONFIG,
  JO_TAX_CONFIG,
);

function getJODefaultInputs(): JOCalculatorInputs {
  return {
    ...baseJOCalculator.getDefaultInputs(),
    hasResidentDependents: false,
    sscMonthlyWage: 0,
  } as JOCalculatorInputs;
}

function normalizeJOInputs(inputs: CalculatorInputs): JOCalculatorInputs {
  const defaultInputs = getJODefaultInputs();
  const partialInputs = inputs as Partial<JOCalculatorInputs>;

  return {
    ...defaultInputs,
    ...partialInputs,
    country: "JO",
    hasResidentDependents: partialInputs.hasResidentDependents ?? false,
    sscMonthlyWage: Math.max(0, partialInputs.sscMonthlyWage ?? 0),
    contributions: {
      ...defaultInputs.contributions,
      ...partialInputs.contributions,
    },
  };
}

export const JOCalculator: CountryCalculator = {
  ...baseJOCalculator,

  calculate(inputs: CalculatorInputs) {
    const normalizedInputs = normalizeJOInputs(inputs);
    const result = baseJOCalculator.calculate(normalizedInputs);
    const sscMonthlyWage = getJordanSscMonthlyWage({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"JO">),
      hasResidentDependents: normalizedInputs.hasResidentDependents,
      sscMonthlyWage,
      sscAnnualWage: sscMonthlyWage * 12,
    } satisfies JOBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getDefaultInputs() {
    return getJODefaultInputs() as CalculatorInputs;
  },
};
