import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
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
  const calculatorInputs: CLCalculatorInputs = {
    ...(getDefaultInputs(country) as CLCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);

  if (isMaxRetirement) {
    assumptions.push("No voluntary APV pension deduction modeled");
  }

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
    assumptions,
    calculation: result,
  };
};
