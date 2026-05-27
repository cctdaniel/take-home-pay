import {
  type CountryComparison,
  type CountryComparisonAdapterContext,
} from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { SACalculatorInputs } from "./types";

export function buildCountryComparison({
  country, config, currency, rate, grossLocal,
  payFrequency, inputs,
  isMaxRetirement, buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as SACalculatorInputs;
  const isResident = inputs.assumptions.isResident;
  const saInputs: SACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employmentType: isResident ? "saudi_national" : "expat",
  };
  const result = calculateNetSalary(saInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push(isResident ? "Saudi national" : "Expatriate");

  return {
    country, name: config.name, currency, rate, grossLocal,
    netLocal: result.netSalary,
    netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0,
    deltaPercent: 0,
    assumptions,
    calculation: result,
  };
}
