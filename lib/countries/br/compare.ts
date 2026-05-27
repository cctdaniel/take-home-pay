import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { BRCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as BRCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
      salaryPackageMode: "includedInGross",
    });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: BRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfDependents: Math.min(inputs.numberOfChildren, 10),
    salaryPackageMode: "includedInGross",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      medicalExpenses: 0,
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
      "Brazil compare treats gross as an annual cash package that already includes the statutory 13th salary.",
      inputs.numberOfChildren > 0
        ? "Compare children are mapped to Brazil IRPF dependents; dependent income is not assumed."
        : "No Brazil IRPF dependents assumed.",
      retirementApplied
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured annual cap`
        : "PGBL private pension left at 0 unless max-retirement is selected",
      "Education and medical expenses are left at 0 in compare because they require local receipts.",
    ],
    calculation: result,
  };
};
