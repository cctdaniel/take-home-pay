import { type CountryComparison, type CountryComparisonAdapterContext } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CHCalculatorInputs } from "./types";

export function buildCountryComparison({
  country, config, currency, rate, grossLocal,
  payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as CHCalculatorInputs;
  const chInputs: CHCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: { pillar3a: isMaxRetirement ? 7_258 : 0 },
  };
  const result = calculateNetSalary(chInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push("Federal tax only (cantonal not modeled) + 6.4% social + optional pillar 3a");

  return {
    country, name: config.name, currency, rate, grossLocal,
    netLocal: result.netSalary, netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0, deltaPercent: 0, assumptions, calculation: result,
  };
}
