import { createStandardCountryCalculator } from "../shared/standard-country";
import type { StandardCountryBreakdown } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { OM_CONFIG } from "./config";
import {
  getOmanExpatProvidentBasicWageMonthly,
  getOmanExpatProvidentEmployerContributionAnnual,
  getOmanOptionalSavingsAnnualLimit,
  getOmanSpfInsuredWageMonthly,
  OM_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { OMBreakdown, OMCalculatorInputs } from "./types";

const baseOMCalculator = createStandardCountryCalculator(
  OM_CONFIG,
  OM_TAX_CONFIG,
);

function getOMDefaultInputs(): OMCalculatorInputs {
  return {
    ...baseOMCalculator.getDefaultInputs(),
    workerType: "expatriate",
    spfInsuredWageMonthly: 0,
    expatProvidentSchemeApplied: false,
    expatProvidentBasicWageMonthly: 0,
  } as OMCalculatorInputs;
}

function normalizeOMInputs(inputs: CalculatorInputs): OMCalculatorInputs {
  const defaultInputs = getOMDefaultInputs();
  const partialInputs = inputs as Partial<OMCalculatorInputs>;

  return {
    ...defaultInputs,
    ...partialInputs,
    country: "OM",
    workerType: partialInputs.workerType ?? "expatriate",
    spfInsuredWageMonthly: Math.max(
      0,
      partialInputs.spfInsuredWageMonthly ?? 0,
    ),
    expatProvidentSchemeApplied:
      partialInputs.workerType === "omani"
        ? false
        : (partialInputs.expatProvidentSchemeApplied ?? false),
    expatProvidentBasicWageMonthly: Math.max(
      0,
      partialInputs.expatProvidentBasicWageMonthly ?? 0,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...partialInputs.contributions,
      retirementContribution: Math.min(
        Math.max(0, partialInputs.contributions?.retirementContribution ?? 0),
        getOmanOptionalSavingsAnnualLimit(partialInputs),
      ),
    },
  };
}

export const OMCalculator: CountryCalculator = {
  ...baseOMCalculator,

  calculate(inputs: CalculatorInputs) {
    const normalizedInputs = normalizeOMInputs(inputs);
    const result = baseOMCalculator.calculate(normalizedInputs);
    const spfInsuredWageMonthly = getOmanSpfInsuredWageMonthly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const expatProvidentBasicWageMonthly =
      getOmanExpatProvidentBasicWageMonthly({
        grossSalary: result.grossSalary,
        inputs: normalizedInputs,
      });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"OM">),
      workerType: normalizedInputs.workerType,
      spfInsuredWageMonthly,
      spfInsuredWageAnnual: spfInsuredWageMonthly * 12,
      expatProvidentSchemeApplied:
        normalizedInputs.expatProvidentSchemeApplied,
      expatProvidentBasicWageMonthly,
      expatProvidentEmployerContributionAnnual:
        getOmanExpatProvidentEmployerContributionAnnual({
          grossSalary: result.grossSalary,
          inputs: normalizedInputs,
        }),
    } satisfies OMBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getDefaultInputs() {
    return getOMDefaultInputs() as CalculatorInputs;
  },
};
