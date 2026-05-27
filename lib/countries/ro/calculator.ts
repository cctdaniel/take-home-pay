import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  CountrySpecificBreakdown,
  RegionInfo,
} from "../types";
import { RO_CONFIG } from "./config";
import {
  calculateRomaniaPersonalDeductionBreakdown,
  RO_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { ROBreakdown, ROCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  RO_CONFIG,
  RO_TAX_CONFIG,
);

function getRODefaultInputs(): ROCalculatorInputs {
  return {
    country: "RO",
    grossSalary: RO_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    claimPersonalDeduction: true,
    dependentCount: 0,
    ageUnder26: false,
    schoolChildren: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      unionFees: 0,
      sportsSubscriptions: 0,
      investmentSubscriptions: 0,
    },
  };
}

function normalizeROInputs(inputs: CalculatorInputs): ROCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"RO"> &
    Partial<ROCalculatorInputs>;
  const defaultInputs = getRODefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "RO",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    claimPersonalDeduction:
      standardInputs.claimPersonalDeduction ??
      defaultInputs.claimPersonalDeduction,
    dependentCount: Math.min(
      Math.max(Math.trunc(standardInputs.dependentCount ?? 0), 0),
      4,
    ),
    ageUnder26: standardInputs.ageUnder26 ?? defaultInputs.ageUnder26,
    schoolChildren: Math.min(
      Math.max(Math.trunc(standardInputs.schoolChildren ?? 0), 0),
      20,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const ROCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "RO") {
      throw new Error("ROCalculator can only calculate Romania inputs");
    }

    const normalizedInputs = normalizeROInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const personalDeductionDetails =
      calculateRomaniaPersonalDeductionBreakdown({
        grossSalary: normalizedInputs.grossSalary,
        claimPersonalDeduction: normalizedInputs.claimPersonalDeduction,
        dependentCount: normalizedInputs.dependentCount,
        ageUnder26: normalizedInputs.ageUnder26,
        schoolChildren: normalizedInputs.schoolChildren,
      });
    const breakdown: ROBreakdown = {
      ...(result.breakdown as ROBreakdown),
      personalDeductionDetails,
      personalDeductionInputs: {
        claimPersonalDeduction: normalizedInputs.claimPersonalDeduction,
        dependentCount: normalizedInputs.dependentCount,
        ageUnder26: normalizedInputs.ageUnder26,
        schoolChildren: normalizedInputs.schoolChildren,
      },
    };

    return {
      ...result,
      breakdown: breakdown as CountrySpecificBreakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getRODefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): ROCalculatorInputs {
    return getRODefaultInputs();
  },
};
