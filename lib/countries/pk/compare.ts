import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { PK_VPS_INCOME_RATE_CAP } from "./constants/tax-year-2026";
import type { PKCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const vpsContribution = isMaxRetirement ? grossLocal * PK_VPS_INCOME_RATE_CAP : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as PKCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { vpsContribution },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (vpsContribution > 0) assumptions.push("VPS at 20% of taxable income cap");
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
