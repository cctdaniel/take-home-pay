import { type CountryComparison, type CountryComparisonAdapterContext } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { TRCalculatorInputs } from "./types";

export function buildCountryComparison({
  country, config, currency, rate, grossLocal,
  payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as TRCalculatorInputs;
  const trInputs: TRCalculatorInputs = { ...defaultInputs, grossSalary: grossLocal, payFrequency };
  const result = calculateNetSalary(trInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push("Progressive 15-40% tax + 15% SGK/UI");

  return {
    country, name: config.name, currency, rate, grossLocal,
    netLocal: result.netSalary, netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0, deltaPercent: 0, assumptions, calculation: result,
  };
}
