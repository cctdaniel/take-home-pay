import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { RO_PRIVATE_PENSION_CAP_RON_2026 } from "./constants/tax-year-2026";
import type { ROCalculatorInputs } from "./types";

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
    ? Math.min(RO_PRIVATE_PENSION_CAP_RON_2026, grossLocal)
    : 0;
  const calculatorInputs: ROCalculatorInputs = {
    ...(getDefaultInputs(country) as ROCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    numberOfChildren: inputs.numberOfChildren,
    contributions: { privatePension },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);

  if (privatePension > 0) {
    assumptions.push("Pillar III private pension at EUR 400 equivalent cap");
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
