import { createStandardCountryCalculator } from "../shared/standard-country";
import type { StandardCountryBreakdown } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { SA_CONFIG } from "./config";
import {
  getSaudiGosiContributoryWageMonthly,
  getSaudiGosiWageComponentsMonthly,
  SA_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { SABreakdown, SACalculatorInputs } from "./types";

const baseSACalculator = createStandardCountryCalculator(
  SA_CONFIG,
  SA_TAX_CONFIG,
);

function normalizeSAInputs(inputs: CalculatorInputs): SACalculatorInputs {
  const defaultInputs = getSADefaultInputs();
  const partialInputs = inputs as Partial<SACalculatorInputs>;
  const workerType =
    partialInputs.workerType === "saudi_standard" ||
    partialInputs.workerType === "saudi_new_system_2026"
      ? partialInputs.workerType
      : "expatriate";

  return {
    ...defaultInputs,
    ...partialInputs,
    country: "SA",
    workerType,
    gosiBasicWageMonthly: Math.max(
      0,
      partialInputs.gosiBasicWageMonthly ?? 0,
    ),
    housingAllowanceType:
      partialInputs.housingAllowanceType === "cash" ||
      partialInputs.housingAllowanceType === "inKind"
        ? partialInputs.housingAllowanceType
        : "none",
    cashHousingAllowanceMonthly: Math.max(
      0,
      partialInputs.cashHousingAllowanceMonthly ?? 0,
    ),
    gosiContributoryWageMonthly:
      partialInputs.gosiContributoryWageMonthly ?? 0,
    contributions: {
      ...defaultInputs.contributions,
      ...partialInputs.contributions,
    },
  };
}

function getSADefaultInputs(): SACalculatorInputs {
  return {
    ...baseSACalculator.getDefaultInputs(),
    workerType: "expatriate",
    gosiBasicWageMonthly: 0,
    housingAllowanceType: "none",
    cashHousingAllowanceMonthly: 0,
    gosiContributoryWageMonthly: 0,
  } as SACalculatorInputs;
}

export const SACalculator: CountryCalculator = {
  ...baseSACalculator,

  calculate(inputs: CalculatorInputs) {
    const normalizedInputs = normalizeSAInputs(inputs);
    const result = baseSACalculator.calculate(normalizedInputs);
    const gosiContributoryWageMonthly = getSaudiGosiContributoryWageMonthly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const gosiWageComponents = getSaudiGosiWageComponentsMonthly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"SA">),
      workerType: normalizedInputs.workerType,
      gosiBasicWageMonthly: gosiWageComponents.basicWage,
      housingAllowanceType: normalizedInputs.housingAllowanceType,
      cashHousingAllowanceMonthly: normalizedInputs.cashHousingAllowanceMonthly,
      gosiHousingValueMonthly: gosiWageComponents.housingValue,
      gosiContributoryWageMonthly,
      gosiContributoryWageAnnual: gosiContributoryWageMonthly * 12,
    } satisfies SABreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getDefaultInputs() {
    return getSADefaultInputs() as CalculatorInputs;
  },
};
