import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator, RegionInfo } from "../types";
import { CH_CONFIG } from "./config";
import {
  calculateCHInsurancePremiumLimit,
  CH_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { CHCalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  CH_CONFIG,
  CH_TAX_CONFIG,
);

function normalizeCHInputs(inputs: CalculatorInputs): CHCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"CH"> &
    Partial<CHCalculatorInputs>;
  const numberOfChildren = Math.max(
    0,
    Math.floor(standardInputs.numberOfChildren ?? 0),
  );
  const numberOfChildcareChildren = Math.min(
    numberOfChildren,
    Math.max(0, Math.floor(standardInputs.numberOfChildcareChildren ?? 0)),
  );
  const numberOfSupportedPersons = Math.max(
    0,
    Math.floor(standardInputs.numberOfSupportedPersons ?? 0),
  );
  const contributions = standardInputs.contributions ?? {
    retirementContribution: 0,
    qualifyingExpenses: 0,
  };

  return {
    ...standardInputs,
    country: "CH",
    grossSalary: Math.max(0, standardInputs.grossSalary),
    payFrequency: standardInputs.payFrequency,
    numberOfChildren,
    numberOfChildcareChildren,
    numberOfSupportedPersons,
    contributions: {
      retirementContribution: contributions.retirementContribution ?? 0,
      qualifyingExpenses: contributions.qualifyingExpenses ?? 0,
      insurancePremiums: contributions.insurancePremiums ?? 0,
      educationExpenses: contributions.educationExpenses ?? 0,
      carerWages: contributions.carerWages ?? 0,
      charitableDonations: contributions.charitableDonations ?? 0,
    },
  };
}

function getCHDefaultInputs(): CHCalculatorInputs {
  const defaultInputs: CHCalculatorInputs = {
    country: "CH",
    grossSalary: CH_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfChildren: 0,
    numberOfChildcareChildren: 0,
    numberOfSupportedPersons: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      educationExpenses: 0,
      carerWages: 0,
      charitableDonations: 0,
    },
  };

  return {
    ...defaultInputs,
    contributions: {
      ...defaultInputs.contributions,
      insurancePremiums: calculateCHInsurancePremiumLimit(defaultInputs),
    },
  };
}

export const CHCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "CH") {
      throw new Error("CHCalculator can only calculate CH inputs");
    }

    return baseCalculator.calculate(normalizeCHInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getCHDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeCHInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<CHCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): CHCalculatorInputs {
    return getCHDefaultInputs();
  },
};
