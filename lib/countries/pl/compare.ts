import { type CountryComparison, type CountryComparisonAdapterContext } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { PLCalculatorInputs } from "./types";

export function buildCountryComparison({
  country, config, currency, rate, grossLocal,
  payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as PLCalculatorInputs;
  const plInputs: PLCalculatorInputs = { ...defaultInputs, grossSalary: grossLocal, payFrequency };
  const result = calculateNetSalary(plInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push("Progressive 12%/32% tax + 13.71% ZUS + 9% NFZ");

  return {
    country, name: config.name, currency, rate, grossLocal,
    netLocal: result.netSalary, netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0, deltaPercent: 0, assumptions, calculation: result,
  };
}
