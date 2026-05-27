import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { HU_CONFIG } from "./config";
import { HU_TAX_CONFIG } from "./constants/tax-year-2026";
import type { HUCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  HU_CONFIG,
  HU_TAX_CONFIG,
);

function getHUDefaultInputs(): HUCalculatorInputs {
  return {
    country: "HU",
    grossSalary: HU_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    pitBaseAllowance: "none",
    claimPersonalAllowance: false,
    claimFirstMarriageAllowance: false,
    beneficiaryDependents: 0,
    totalDependents: 0,
    claimFamilyContributionAllowance: true,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeHUInputs(inputs: CalculatorInputs): HUCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"HU"> &
    Partial<HUCalculatorInputs>;
  const defaultInputs = getHUDefaultInputs();
  const beneficiaryDependents = Math.min(
    Math.max(0, standardInputs.beneficiaryDependents ?? 0),
    10,
  );

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "HU",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    pitBaseAllowance: standardInputs.pitBaseAllowance ?? "none",
    claimPersonalAllowance: standardInputs.claimPersonalAllowance ?? false,
    claimFirstMarriageAllowance:
      standardInputs.claimFirstMarriageAllowance ?? false,
    beneficiaryDependents,
    totalDependents: Math.min(
      Math.max(beneficiaryDependents, standardInputs.totalDependents ?? 0),
      10,
    ),
    claimFamilyContributionAllowance:
      standardInputs.claimFamilyContributionAllowance ?? true,
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const HUCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "HU") {
      throw new Error("HUCalculator can only calculate Hungary inputs");
    }

    return baseCalculator.calculate(normalizeHUInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getHUDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): HUCalculatorInputs {
    return getHUDefaultInputs();
  },
};
