import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { getColombiaVoluntaryCombinedLimit } from "./calculator";
import type { COCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const cap = isMaxRetirement ? getColombiaVoluntaryCombinedLimit(grossLocal) : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as COCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { afcSavings: cap / 2, voluntaryPension: cap - cap / 2 },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (cap > 0) assumptions.push("AFC + voluntary pension at combined cap");
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
