import { createStandardCountryCalculator } from "../shared/standard-country";
import type { StandardCountryBreakdown } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { EG_CONFIG } from "./config";
import {
  EG_TAX_CONFIG,
  getEgyptSocialInsuranceSalaryMonthly,
} from "./constants/tax-year-2026";
import type { EGBreakdown, EGCalculatorInputs } from "./types";

const baseEGCalculator = createStandardCountryCalculator(
  EG_CONFIG,
  EG_TAX_CONFIG,
);

function getEGDefaultInputs(): EGCalculatorInputs {
  return {
    ...baseEGCalculator.getDefaultInputs(),
    taxableNonCashBenefits: 0,
    socialInsuranceCovered: true,
    socialInsuranceSalaryMonthly: 0,
  } as EGCalculatorInputs;
}

function normalizeEGInputs(inputs: CalculatorInputs): EGCalculatorInputs {
  const defaultInputs = getEGDefaultInputs();
  const partialInputs = inputs as Partial<EGCalculatorInputs>;

  return {
    ...defaultInputs,
    ...partialInputs,
    country: "EG",
    taxableNonCashBenefits: Math.max(
      0,
      partialInputs.taxableNonCashBenefits ?? 0,
    ),
    socialInsuranceCovered:
      partialInputs.socialInsuranceCovered ?? defaultInputs.socialInsuranceCovered,
    socialInsuranceSalaryMonthly: Math.max(
      0,
      partialInputs.socialInsuranceSalaryMonthly ?? 0,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...partialInputs.contributions,
    },
  };
}

export const EGCalculator: CountryCalculator = {
  ...baseEGCalculator,

  calculate(inputs: CalculatorInputs) {
    const normalizedInputs = normalizeEGInputs(inputs);
    const result = baseEGCalculator.calculate(normalizedInputs);
    const socialInsuranceSalaryMonthly =
      getEgyptSocialInsuranceSalaryMonthly({
        cashSalary: result.grossSalary,
        inputs: normalizedInputs,
      });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"EG">),
      socialInsuranceCovered: normalizedInputs.socialInsuranceCovered,
      socialInsuranceSalaryMonthly,
      socialInsuranceSalaryAnnual: socialInsuranceSalaryMonthly * 12,
    } satisfies EGBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getDefaultInputs() {
    return getEGDefaultInputs() as CalculatorInputs;
  },
};
