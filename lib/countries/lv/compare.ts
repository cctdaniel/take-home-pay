import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  LV_PRIVATE_PENSION_ANNUAL_CAP_2026,
  LV_PRIVATE_PENSION_RATE_OF_GROSS,
} from "./constants/tax-year-2026";
import type { LVCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const privatePension = isMaxRetirement
    ? Math.min(LV_PRIVATE_PENSION_ANNUAL_CAP_2026, grossLocal * LV_PRIVATE_PENSION_RATE_OF_GROSS)
    : 0;
  const calculatorInputs: LVCalculatorInputs = {
    ...(getDefaultInputs(country) as LVCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { privatePension },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (privatePension > 0) assumptions.push("Private pension at modeled cap");
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
