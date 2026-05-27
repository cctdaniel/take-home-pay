import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs, CountryCode } from "@/lib/countries/types";
import type { StandardCountryCalculatorInputs } from "./standard-country";

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
  const defaultCalculatorInputs = getDefaultInputs(country);
  const defaultInputs =
    defaultCalculatorInputs as StandardCountryCalculatorInputs<CountryCode>;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultCalculatorInputs,
      grossSalary: grossLocal,
    });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: StandardCountryCalculatorInputs<CountryCode> = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: {
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
      `Ordinary resident employee model for ${config.name}`,
      retirementLimit > 0
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured annual cap`
        : `No modeled ${config.name}-specific retirement contribution`,
    ],
    calculation: result,
  };
};
