import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { CH_PILLAR_3A_LIMIT_2026 } from "./constants/tax-year-2026";
import type { CHCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as CHCalculatorInputs;
  const pillar3a = isMaxRetirement ? CH_PILLAR_3A_LIMIT_2026 : 0;
  const calculatorInputs: CHCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    filingStatus: inputs.maritalStatus === "married" ? "married" : "single",
    contributions: { pillar3a },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    `Canton ${defaultInputs.canton} baseline`,
    inputs.maritalStatus === "married"
      ? "Married income splitting"
      : "Single filer",
  ];
  if (pillar3a > 0) {
    assumptions.push("Pillar 3a at annual max");
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
