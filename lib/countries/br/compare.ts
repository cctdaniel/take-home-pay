import { type CountryComparison, type CountryComparisonAdapterContext } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { BRCalculatorInputs } from "./types";

export function buildCountryComparison({
  country, config, currency, rate, grossLocal,
  payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as BRCalculatorInputs;
  const brInputs: BRCalculatorInputs = { ...defaultInputs, grossSalary: grossLocal, payFrequency };
  const result = calculateNetSalary(brInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push("Progressive 0-27.5% IRPF + 7.5-14% INSS");

  return {
    country, name: config.name, currency, rate, grossLocal,
    netLocal: result.netSalary, netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0, deltaPercent: 0, assumptions, calculation: result,
  };
}
