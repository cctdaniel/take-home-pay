import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { MECalculatorInputs } from "./types";

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
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as MECalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: {},
  });
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Montenegro employment salary with pension and unemployment on gross",
    "Foreign remote income territorial exemption not modeled",
  ];
  if (isMaxRetirement) {
    assumptions.push("No voluntary tax-reducing retirement modeled");
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
