import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { ROCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as ROCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });
  const retirementLimit =
    contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const retirementApplied = retirementContribution > 0;
  const calculatorInputs: ROCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    claimPersonalDeduction: true,
    dependentCount: Math.min(Math.max(inputs.numberOfChildren, 0), 4),
    ageUnder26: inputs.assumptions.age < 26,
    schoolChildren: inputs.assumptions.hasYoungChildren
      ? Math.min(inputs.numberOfChildren, 10)
      : 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);

  return {
    country,
    name: config.name,
    currency,
    rate,
    grossLocal,
    netLocal: result.netSalary,
    netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0,
    deltaPercent: 0,
    assumptions: [
      ...buildAssumptionsSummary(country, inputs, retirementApplied),
      "Ordinary resident employee model for Romania",
      "Article 77 personal deduction claimed at the main employment place",
      inputs.numberOfChildren > 0
        ? "Children mapped as dependents for the basic personal deduction"
        : "No dependents assumed for the basic personal deduction",
      inputs.assumptions.hasYoungChildren && inputs.numberOfChildren > 0
        ? "School-child deduction included for children under 18"
        : "No school-child deduction assumed",
      inputs.assumptions.age < 26
        ? "Under-26 supplemental deduction included when income-eligible"
        : "No under-26 supplemental deduction",
      retirementApplied
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured annual cap`
        : "No modeled voluntary pension contribution",
    ],
    calculation: result,
  };
};
