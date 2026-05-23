import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { FR_TAX_CONFIG } from "./constants/tax-year-2026";
import type { FRCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as FRCalculatorInputs;
  const retirementSavingsLimit = FR_TAX_CONFIG.retirementSavingsLimit;
  const retirementSavings = inputs.assumptions.retirementContributions === "max"
    ? Math.min(retirementSavingsLimit, grossLocal)
    : 0;
  const taxHouseholdParts = inputs.maritalStatus === "married"
    ? 2 + Math.min(inputs.numberOfChildren, 2) * 0.5 + Math.max(0, inputs.numberOfChildren - 2)
    : 1 + Math.min(inputs.numberOfChildren, 2) * 0.5 + Math.max(0, inputs.numberOfChildren - 2);
  const calculatorInputs: FRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxHouseholdParts,
    contributions: {
      ...defaultInputs.contributions,
      retirementSavings,
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
      ...buildAssumptionsSummary(country, inputs, retirementSavings > 0),
      "Ordinary resident employee model for France",
      `Family quotient parts: ${taxHouseholdParts}`,
    ],
    calculation: result,
  };
};
