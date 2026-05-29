import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { UA_NPF_ANNUAL_CAP_2026 } from "./constants/tax-year-2026";
import type { UACalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const npfContribution = isMaxRetirement ? Math.min(UA_NPF_ANNUAL_CAP_2026, grossLocal) : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as UACalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { npfContribution },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (npfContribution > 0) assumptions.push("NPF contributions at annual cap with 18% tax discount");
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
