import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { NGCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as NGCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: {},
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  assumptions.push("Mandatory pension 8% before NTA 2025 PAYE");
  if (isMaxRetirement) {
    assumptions.push("No voluntary AVC or additional pension modeled");
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
