import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { RS_VOLUNTARY_PENSION_ANNUAL_CAP } from "./constants/tax-year-2026";
import type { RSCalculatorInputs } from "./types";

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
  const voluntaryPension = isMaxRetirement ? RS_VOLUNTARY_PENSION_ANNUAL_CAP : 0;
  const calculatorInputs: RSCalculatorInputs = {
    ...(getDefaultInputs(country) as RSCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { voluntaryPension },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Flat 10% PIT after social and annual non-taxable amount",
  ];
  if (voluntaryPension > 0) {
    assumptions.push("Voluntary private pension at RSD 8,677/month cap");
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
