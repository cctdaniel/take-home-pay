import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { LU_CONFIG } from "./config";
import { LU_TAX_CONFIG } from "./constants/tax-year-2026";
import type { LUCalculatorInputs, LUTaxClass } from "./types";

const baseCalculator = createStandardCountryCalculator(
  LU_CONFIG,
  LU_TAX_CONFIG,
);

function clampAge(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 35;
  }

  return Math.min(Math.max(18, Math.floor(value ?? 35)), 100);
}

function clampChildren(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, Math.floor(value ?? 0)), 10);
}

function resolveTaxClass(
  taxClass: LUTaxClass | undefined,
  age: number,
  numberOfChildren: number,
): LUTaxClass {
  if (taxClass) {
    return taxClass;
  }

  return numberOfChildren > 0 || age >= 65 ? "class1a" : "class1";
}

function normalizeLUInputs(inputs: CalculatorInputs): LUCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"LU"> &
    Partial<LUCalculatorInputs>;
  const age = clampAge(standardInputs.age);
  const numberOfChildren = clampChildren(standardInputs.numberOfChildren);

  return {
    ...standardInputs,
    country: "LU",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    taxClass: resolveTaxClass(standardInputs.taxClass, age, numberOfChildren),
    age,
    numberOfChildren,
    claimSingleParentCredit: Boolean(standardInputs.claimSingleParentCredit),
    childSupportOrAllowancesReceived: Math.max(
      0,
      standardInputs.childSupportOrAllowancesReceived ?? 0,
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function getLUDefaultInputs(): LUCalculatorInputs {
  return {
    country: "LU",
    grossSalary: LU_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    taxClass: "class1",
    age: 35,
    numberOfChildren: 0,
    claimSingleParentCredit: false,
    childSupportOrAllowancesReceived: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

export const LUCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "LU") {
      throw new Error("LUCalculator can only calculate Luxembourg inputs");
    }

    return baseCalculator.calculate(normalizeLUInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getLUDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeLUInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<LUCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): LUCalculatorInputs {
    return getLUDefaultInputs();
  },
};
