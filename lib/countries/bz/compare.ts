import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { BZCalculatorInputs } from "./types";

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
    ...(getDefaultInputs(country) as BZCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: {},
  });
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Belize employment salary with capped social security and flat PIT above exemption",
    "QRP and foreign-sourced income special regimes not modeled",
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
