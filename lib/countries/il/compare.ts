import { type CountryComparison, type CountryComparisonAdapterContext } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { ILCalculatorInputs } from "./types";

export function buildCountryComparison({
  country, config, currency, rate, grossLocal,
  payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as ILCalculatorInputs;
  const ilInputs: ILCalculatorInputs = { ...defaultInputs, grossSalary: grossLocal, payFrequency };
  const result = calculateNetSalary(ilInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push("Progressive 10-50% tax + Bituach Leumi + health");

  return {
    country, name: config.name, currency, rate, grossLocal,
    netLocal: result.netSalary, netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0, deltaPercent: 0, assumptions, calculation: result,
  };
}
