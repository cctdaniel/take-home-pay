import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { DOCalculatorInputs } from "./types";

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
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as DOCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: {},
  });
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Dominican Republic employment salary with TSS and progressive ISR",
  ];
  if (isMaxRetirement) {
    assumptions.push(
      "Voluntary AFP top-ups are not modeled as ISR deductions (Ley 87-01 Art. 15)",
    );
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
