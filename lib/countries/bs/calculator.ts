import {
  createStandardCountryCalculator,
  type StandardCountryBreakdown,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { BS_CONFIG } from "./config";
import {
  getBahamasNibBasicWageEmployeeRate,
  getBahamasNibEmployerOnlyContributionAnnual,
  getBahamasNibFormalGratuitiesWeekly,
  getBahamasNibInsurableWeeklyWage,
  isBahamasNibEmployerOnlyCategory,
  BS_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { BSBreakdown, BSCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  BS_CONFIG,
  BS_TAX_CONFIG,
);

function getBSDefaultInputs(): BSCalculatorInputs {
  return {
    country: "BS",
    grossSalary: BS_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    nibCategory: "standard",
    nibInsurableWeeklyWage: 0,
    weeklyFormalGratuities: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeBSInputs(inputs: CalculatorInputs): BSCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"BS"> &
    Partial<BSCalculatorInputs>;

  return {
    ...standardInputs,
    country: "BS",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    nibCategory: standardInputs.nibCategory ?? "standard",
    nibInsurableWeeklyWage: Math.max(
      0,
      standardInputs.nibInsurableWeeklyWage ?? 0,
    ),
    weeklyFormalGratuities: isBahamasNibEmployerOnlyCategory(standardInputs)
      ? 0
      : Math.max(0, standardInputs.weeklyFormalGratuities ?? 0),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

export const BSCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "BS") {
      throw new Error("BSCalculator can only calculate The Bahamas inputs");
    }

    const normalizedInputs = normalizeBSInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const nibInsurableWeeklyWage = getBahamasNibInsurableWeeklyWage({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const weeklyFormalGratuities = getBahamasNibFormalGratuitiesWeekly({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const breakdown = {
      ...(result.breakdown as StandardCountryBreakdown<"BS">),
      nibCategory: normalizedInputs.nibCategory,
      nibInsurableWeeklyWage,
      nibInsurableAnnualWage: nibInsurableWeeklyWage * 52,
      weeklyFormalGratuities,
      annualFormalGratuities: weeklyFormalGratuities * 52,
      nibBasicWageEmployeeRate:
        getBahamasNibBasicWageEmployeeRate(normalizedInputs),
      nibEmployerOnlyContributionAnnual:
        getBahamasNibEmployerOnlyContributionAnnual({
          grossSalary: result.grossSalary,
          inputs: normalizedInputs,
        }),
    } satisfies BSBreakdown;

    return {
      ...result,
      breakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getBSDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): BSCalculatorInputs {
    return getBSDefaultInputs();
  },
};
