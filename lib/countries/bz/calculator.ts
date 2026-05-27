import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { BZ_CONFIG } from "./config";
import {
  BZ_CHARITABLE_RELIEF_MINIMUM,
  BZ_EDUCATION_RELIEF_CHILD_LIMIT,
  BZ_TAX_CONFIG,
  calculateBelizeSsbEmployeeContribution,
  calculateBelizeSsbEmployeeWeeklyContribution,
  calculateBelizeSsbEmployerOnlyContributionAnnual,
  getBelizeSsbWeeklyInsurableEarnings,
} from "./constants/tax-year-2026";
import type { BZBreakdown, BZCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  BZ_CONFIG,
  BZ_TAX_CONFIG,
);

function getBZDefaultInputs(): BZCalculatorInputs {
  return {
    country: "BZ",
    grossSalary: BZ_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    socialSecurityStatus: "standard",
    ssbWeeklyInsurableEarnings: 0,
    educationReliefChildren: 0,
    contributions: {
      retirementContribution: 0,
      charitableDonations: 0,
      educationExpenses: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeCharitableDonation(amount: number): number {
  const normalizedAmount = Math.max(0, amount);

  return normalizedAmount > 0 && normalizedAmount < BZ_CHARITABLE_RELIEF_MINIMUM
    ? 0
    : normalizedAmount;
}

function normalizeBZInputs(inputs: CalculatorInputs): BZCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"BZ"> &
    Partial<BZCalculatorInputs>;
  const defaultInputs = getBZDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "BZ",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    socialSecurityStatus: standardInputs.socialSecurityStatus ?? "standard",
    ssbWeeklyInsurableEarnings: Math.max(
      0,
      standardInputs.ssbWeeklyInsurableEarnings ?? 0,
    ),
    educationReliefChildren: Math.min(
      Math.max(0, Math.trunc(standardInputs.educationReliefChildren ?? 0)),
      BZ_EDUCATION_RELIEF_CHILD_LIMIT,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
      charitableDonations: normalizeCharitableDonation(
        standardInputs.contributions?.charitableDonations ??
          standardInputs.contributions?.qualifyingExpenses ??
          0,
      ),
      educationExpenses:
        standardInputs.contributions?.educationExpenses ?? 0,
      qualifyingExpenses: 0,
    },
  };
}

export const BZCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "BZ") {
      throw new Error("BZCalculator can only calculate Belize inputs");
    }

    const normalizedInputs = normalizeBZInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const ssbWeeklyInsurableEarnings = getBelizeSsbWeeklyInsurableEarnings({
      grossSalary: result.grossSalary,
      inputs: normalizedInputs,
    });
    const ssbEmployeeWeeklyContribution =
      calculateBelizeSsbEmployeeWeeklyContribution(ssbWeeklyInsurableEarnings);
    const breakdown = {
      ...(result.breakdown as BZBreakdown),
      socialSecurityStatus: normalizedInputs.socialSecurityStatus,
      ssbWeeklyInsurableEarnings,
      ssbEmployeeWeeklyContribution,
      ssbEmployeeAnnualContribution: calculateBelizeSsbEmployeeContribution({
        grossSalary: result.grossSalary,
        inputs: normalizedInputs,
      }),
      ssbEmployerOnlyAnnualContribution:
        calculateBelizeSsbEmployerOnlyContributionAnnual(normalizedInputs),
      educationReliefChildren: normalizedInputs.educationReliefChildren,
    } satisfies BZBreakdown;

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
      ...getBZDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): BZCalculatorInputs {
    return getBZDefaultInputs();
  },
};
