import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CLCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as CLCalculatorInputs;
  const contributionLimits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
  });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: CLCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contractType: "indefinite",
    apvTaxRegime: "regimeB",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      medicalExpenses: 0,
      qualifyingExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
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
      "Ordinary dependent employee model for Chile",
      "Indefinite contract with employee unemployment insurance in compare",
      retirementApplied
        ? "APV regime-B contribution modeled to the annual cap"
        : "No APV contribution modeled; country page supports regime A fiscal-bonus APV and regime B deduction APV",
      "No additional Isapre health-plan premium entered in compare",
    ],
    calculation: result,
  };
};
