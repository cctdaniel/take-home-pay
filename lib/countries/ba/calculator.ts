import { createStandardCountryCalculator } from "../shared/standard-country";
import type { CalculatorInputs, CountryCalculator } from "../types";
import { BA_CONFIG } from "./config";
import { BA_TAX_CONFIG } from "./constants/tax-year-2026";
import type { BACalculatorInputs, BAEntity } from "./types";

const baseBACalculator = createStandardCountryCalculator(
  BA_CONFIG,
  BA_TAX_CONFIG,
);

function normalizeEntity(value: unknown): BAEntity {
  return value === "rs" || value === "bd" ? value : "fbih";
}

function normalizeBAInputs(inputs: Partial<BACalculatorInputs>): BACalculatorInputs {
  return {
    ...baseBACalculator.getDefaultInputs(),
    ...inputs,
    country: "BA",
    grossSalary: Math.max(0, inputs.grossSalary ?? BA_TAX_CONFIG.defaultSalary),
    payFrequency: inputs.payFrequency ?? "monthly",
    entity: normalizeEntity(inputs.entity),
    hasDependentSpouse: inputs.hasDependentSpouse ?? false,
    dependentChildren: Math.max(0, Math.floor(inputs.dependentChildren ?? 0)),
    dependentParents: Math.max(0, Math.floor(inputs.dependentParents ?? 0)),
    otherDependents: Math.max(0, Math.floor(inputs.otherDependents ?? 0)),
    bdDisabilityPercent: Math.min(
      Math.max(0, Math.floor(inputs.bdDisabilityPercent ?? 0)),
      100,
    ),
    bdPermanentDisability: inputs.bdPermanentDisability ?? false,
    contributions: {
      retirementContribution: inputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: inputs.contributions?.qualifyingExpenses ?? 0,
      mortgageInterest: inputs.contributions?.mortgageInterest ?? 0,
      lifeInsurancePremium: inputs.contributions?.lifeInsurancePremium ?? 0,
      educationExpenses: inputs.contributions?.educationExpenses ?? 0,
    },
  };
}

export const BACalculator: CountryCalculator = {
  ...baseBACalculator,

  calculate(inputs: CalculatorInputs) {
    return baseBACalculator.calculate(
      normalizeBAInputs(inputs as Partial<BACalculatorInputs>),
    );
  },

  getDefaultInputs() {
    return normalizeBAInputs({});
  },
};
