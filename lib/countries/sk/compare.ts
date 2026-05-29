import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { SK_THIRD_PILLAR_ANNUAL_CAP_2026 } from "./constants/tax-year-2026";
import type { SKCalculatorInputs } from "./types";

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
  const thirdPillar = isMaxRetirement
    ? Math.min(SK_THIRD_PILLAR_ANNUAL_CAP_2026, grossLocal)
    : 0;
  const calculatorInputs: SKCalculatorInputs = {
    ...(getDefaultInputs(country) as SKCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { thirdPillar },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (thirdPillar > 0) {
    assumptions.push("Third pillar at annual cap (EUR 180)");
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
