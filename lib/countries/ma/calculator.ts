import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { MA_CONFIG } from "./config";
import {
  getMoroccoAmoAnnualBase,
  getMoroccoCnssSocialAnnualBase,
  getMoroccoSocialMonthlyWage,
  MA_FAMILY_CHARGE_DEPENDENT_CAP,
  MA_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { MABreakdown, MACalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  MA_CONFIG,
  MA_TAX_CONFIG,
);

function normalizeMAInputs(inputs: CalculatorInputs): MACalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"MA"> &
    Partial<MACalculatorInputs>;
  const numberOfDependents = Math.floor(standardInputs.numberOfDependents ?? 0);

  return {
    ...standardInputs,
    country: "MA",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    numberOfDependents: Number.isFinite(numberOfDependents)
      ? Math.min(
          Math.max(0, numberOfDependents),
          MA_FAMILY_CHARGE_DEPENDENT_CAP,
        )
      : 0,
    firstEmploymentExemption: standardInputs.firstEmploymentExemption ?? false,
    cnssAmoMonthlyWage: Math.max(0, standardInputs.cnssAmoMonthlyWage ?? 0),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      housingExpenses: standardInputs.contributions?.housingExpenses ?? 0,
      charitableDonations:
        standardInputs.contributions?.charitableDonations ?? 0,
    },
  };
}

function getMADefaultInputs(): MACalculatorInputs {
  return {
    country: "MA",
    grossSalary: MA_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfDependents: 0,
    firstEmploymentExemption: false,
    cnssAmoMonthlyWage: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      charitableDonations: 0,
    },
  };
}

function calculateMAResult(inputs: MACalculatorInputs): CalculationResult {
  const baseResult = baseCalculator.calculate(inputs);
  const baseBreakdown = baseResult.breakdown as MABreakdown;
  const socialGrossSalary =
    baseBreakdown.taxableGrossIncome ?? baseResult.grossSalary;
  const cnssAmoMonthlyWage = getMoroccoSocialMonthlyWage({
    grossSalary: socialGrossSalary,
    inputs,
  });
  const breakdown = {
    ...baseBreakdown,
    numberOfDependents: inputs.numberOfDependents,
    firstEmploymentExemption: inputs.firstEmploymentExemption,
    cnssAmoMonthlyWage,
    cnssSocialAnnualBase: getMoroccoCnssSocialAnnualBase({
      grossSalary: socialGrossSalary,
      inputs,
    }),
    amoAnnualBase: getMoroccoAmoAnnualBase({
      grossSalary: socialGrossSalary,
      inputs,
    }),
  } satisfies MABreakdown;

  return {
    ...baseResult,
    breakdown,
  };
}

export const MACalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "MA") {
      throw new Error("MACalculator can only calculate Morocco inputs");
    }

    return calculateMAResult(normalizeMAInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getMADefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeMAInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<MACalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): MACalculatorInputs {
    return getMADefaultInputs();
  },
};
