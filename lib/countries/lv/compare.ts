import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { LV_RETIREMENT_ABSOLUTE_LIMIT } from "./constants/tax-year-2026";
import type { LVCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as LVCalculatorInputs;
  const numberOfDependents = Math.min(inputs.numberOfChildren, 10);
  const retirementContribution = isMaxRetirement
    ? Math.min(LV_RETIREMENT_ABSOLUTE_LIMIT, grossLocal * 0.1, grossLocal)
    : 0;
  const calculatorInputs: LVCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfDependents,
    isPensioner: false,
    pensionerAllowanceUsedElsewhere: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
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
      "Ordinary resident employee model for Latvia",
      numberOfDependents > 0
        ? "Dependant allowance mapped from compare children"
        : "No dependant allowance",
      "General employee non-taxable minimum; no pensioner minimum selected",
      "Education, medical, and donation expenses left at zero in compare",
    ],
    calculation: result,
  };
};
