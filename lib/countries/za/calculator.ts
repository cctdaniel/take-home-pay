import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { ZA_CONFIG } from "./config";
import { ZA_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ZACalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  ZA_CONFIG,
  ZA_TAX_CONFIG,
);

function getZADefaultInputs(): ZACalculatorInputs {
  return {
    country: "ZA",
    grossSalary: ZA_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    taxableNonCashBenefits: 0,
    ageBand: "under65",
    medicalSchemeMembers: 0,
    hasDisabilityInFamily: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
    },
  };
}

function normalizeZAInputs(inputs: CalculatorInputs): ZACalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"ZA"> &
    Partial<ZACalculatorInputs>;

  return {
    ...standardInputs,
    country: "ZA",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    taxableNonCashBenefits: Math.max(
      0,
      standardInputs.taxableNonCashBenefits ?? 0,
    ),
    ageBand: standardInputs.ageBand ?? "under65",
    medicalSchemeMembers: Math.min(
      Math.max(0, standardInputs.medicalSchemeMembers ?? 0),
      20,
    ),
    hasDisabilityInFamily: standardInputs.hasDisabilityInFamily ?? false,
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      medicalExpenses: standardInputs.contributions?.medicalExpenses ?? 0,
      insurancePremiums: standardInputs.contributions?.insurancePremiums ?? 0,
      charitableDonations:
        standardInputs.contributions?.charitableDonations ?? 0,
    },
  };
}

export const ZACalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "ZA") {
      throw new Error("ZACalculator can only calculate South Africa inputs");
    }

    return baseCalculator.calculate(normalizeZAInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getZADefaultInputs();
    const normalizedInputs = normalizeZAInputs({
      ...defaultInputs,
      ...inputs,
      contributions: {
        ...defaultInputs.contributions,
        ...(inputs as Partial<ZACalculatorInputs>)?.contributions,
      },
    } as CalculatorInputs);
    const taxableGrossSalary =
      normalizedInputs.grossSalary +
      (normalizedInputs.taxableNonCashBenefits ?? 0);

    return baseCalculator.getContributionLimits(
      {
        ...normalizedInputs,
        grossSalary: taxableGrossSalary,
        taxableNonCashBenefits: 0,
      },
    );
  },

  getDefaultInputs(): ZACalculatorInputs {
    return getZADefaultInputs();
  },
};
