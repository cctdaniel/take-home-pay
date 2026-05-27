import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
  type StandardCountryBreakdown,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { EC_CONFIG } from "./config";
import {
  EC_TAX_CONFIG,
  getECIncomeExemption,
  getECPersonalExpenseBasketCount,
} from "./constants/tax-year-2026";
import type {
  ECBreakdown,
  ECCalculatorInputs,
  ECIncomeExemptionType,
} from "./types";

const baseCalculator = createStandardCountryCalculator(
  EC_CONFIG,
  EC_TAX_CONFIG,
);

function normalizeIncomeExemptionType(
  value: unknown,
): ECIncomeExemptionType {
  return value === "olderAdult" ||
    value === "disability30to49" ||
    value === "disability50to74" ||
    value === "disability75to84" ||
    value === "disability85to100"
    ? value
    : "none";
}

function getECDefaultInputs(): ECCalculatorInputs {
  return {
    country: "EC",
    grossSalary: EC_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    familyDependents: 0,
    hasDisabilityOrCatastrophicIllness: false,
    incomeExemptionType: "none",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizeECInputs(inputs: CalculatorInputs): ECCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"EC"> &
    Partial<ECCalculatorInputs>;
  const defaultInputs = getECDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "EC",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    familyDependents: Math.min(
      Math.max(0, standardInputs.familyDependents ?? 0),
      5,
    ),
    hasDisabilityOrCatastrophicIllness:
      standardInputs.hasDisabilityOrCatastrophicIllness ?? false,
    incomeExemptionType: normalizeIncomeExemptionType(
      standardInputs.incomeExemptionType,
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

export const ECCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "EC") {
      throw new Error("ECCalculator can only calculate Ecuador inputs");
    }

    const normalizedInputs = normalizeECInputs(inputs);
    const result = baseCalculator.calculate(normalizedInputs);
    const standardBreakdown = result.breakdown as StandardCountryBreakdown<"EC">;
    const incomeExemption = getECIncomeExemption(
      normalizedInputs.incomeExemptionType,
    );
    const breakdown: ECBreakdown = {
      ...standardBreakdown,
      incomeExemptionType: normalizedInputs.incomeExemptionType,
      incomeExemptionName: incomeExemption.name,
      personalAllowanceName: incomeExemption.name,
      personalExpenseBasketCount:
        getECPersonalExpenseBasketCount(normalizedInputs),
    };

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
      ...getECDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): ECCalculatorInputs {
    return getECDefaultInputs();
  },
};
