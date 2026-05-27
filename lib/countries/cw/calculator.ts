import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { CW_CONFIG } from "./config";
import { CW_TAX_CONFIG } from "./constants/tax-year-2026";
import type { CWCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  CW_CONFIG,
  CW_TAX_CONFIG,
);

function normalizeCWInputs(inputs: CalculatorInputs): CWCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"CW"> &
    Partial<CWCalculatorInputs>;

  return {
    ...standardInputs,
    country: "CW",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    taxResidency: standardInputs.taxResidency ?? "resident",
    isMarriedSingleEarner: standardInputs.isMarriedSingleEarner ?? false,
    isAge60OrOlder: standardInputs.isAge60OrOlder ?? false,
    hasTransferredElderlyAllowance:
      standardInputs.hasTransferredElderlyAllowance ?? false,
    childAllowanceCategoryI: Math.max(
      0,
      Math.floor(standardInputs.childAllowanceCategoryI ?? 0),
    ),
    childAllowanceCategoryII: Math.max(
      0,
      Math.floor(standardInputs.childAllowanceCategoryII ?? 0),
    ),
    childAllowanceCategoryIII: Math.max(
      0,
      Math.floor(standardInputs.childAllowanceCategoryIII ?? 0),
    ),
    childAllowanceCategoryIV: Math.max(
      0,
      Math.floor(standardInputs.childAllowanceCategoryIV ?? 0),
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function getCWDefaultInputs(): CWCalculatorInputs {
  return {
    country: "CW",
    grossSalary: CW_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    taxResidency: "resident",
    isMarriedSingleEarner: false,
    isAge60OrOlder: false,
    hasTransferredElderlyAllowance: false,
    childAllowanceCategoryI: 0,
    childAllowanceCategoryII: 0,
    childAllowanceCategoryIII: 0,
    childAllowanceCategoryIV: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

export const CWCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "CW") {
      throw new Error("CWCalculator can only calculate CW inputs");
    }

    return baseCalculator.calculate(normalizeCWInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getCWDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeCWInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<CWCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): CWCalculatorInputs {
    return getCWDefaultInputs();
  },
};
