import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { BHCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as BHCalculatorInputs;
  const result = calculateNetSalary({
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    nationality: "expatriate",
    contributions: {},
  });
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Expatriate employee; 1% unemployment on capped base; no income tax",
  ];
  if (isMaxRetirement) {
    assumptions.push(
      "No income tax on salary; voluntary contributions do not reduce wage tax",
    );
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
