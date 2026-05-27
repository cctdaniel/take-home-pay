import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { CRCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as CRCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
      aguinaldoMode: "includedInGross",
    });
  const pensionLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && pensionLimit > 0
      ? Math.min(pensionLimit, grossLocal)
      : 0;
  const calculatorInputs: CRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    hasEligibleSpouse: false,
    numberOfChildren: inputs.numberOfChildren,
    aguinaldoMode: "includedInGross",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs as CalculatorInputs);
  const retirementApplied = retirementContribution > 0;

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
      "Costa Rica compare treats gross as an annual cash package that already includes the legal one-twelfth aguinaldo.",
      `${inputs.numberOfChildren} eligible child credit(s) mapped from compare dependents; spouse credit is not assumed in compare.`,
      retirementApplied
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured 10% regular-salary cap`
        : "Voluntary complementary pension left at 0 unless max-retirement is selected",
    ],
    calculation: result,
  };
};
