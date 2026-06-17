import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { MA_DEPENDENT_CREDIT_2026 } from "./constants/tax-year-2026";
import type { MACalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const dependents = Math.min(inputs.numberOfChildren, MA_DEPENDENT_CREDIT_2026.maxDependents);
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as MACalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    dependents,
    contributions: {},
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  assumptions.push("CNSS + AMO, 20% professional expenses, IR brackets");
  if (dependents > 0) {
    assumptions.push(`${dependents} dependent(s) for MAD 360/month credit each`);
  }
  if (isMaxRetirement) {
    assumptions.push("No voluntary retirement relief modeled");
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
