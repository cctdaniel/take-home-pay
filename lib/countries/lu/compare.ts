import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { LU_PRIVATE_PENSION_ANNUAL_CAP_2026 } from "./constants/tax-year-2026";
import type { LUCalculatorInputs } from "./types";

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
  const privatePension = isMaxRetirement
    ? Math.min(LU_PRIVATE_PENSION_ANNUAL_CAP_2026, grossLocal)
    : 0;
  const calculatorInputs: LUCalculatorInputs = {
    ...(getDefaultInputs(country) as LUCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { privatePension },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (privatePension > 0) {
    assumptions.push("Private pension (Article 111bis) at EUR 4,500 cap");
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
