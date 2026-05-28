import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026 } from "./constants/tax-year-2026";
import type { HUCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as HUCalculatorInputs;
  const voluntaryPension = isMaxRetirement
    ? Math.min(HU_VOLUNTARY_PENSION_ANNUAL_CAP_2026, grossLocal)
    : 0;
  const calculatorInputs: HUCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfChildren: 0,
    under25FullExemption: false,
    contributions: { voluntaryPension },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "No family allowance or under-25 exemption in compare",
  ];
  if (voluntaryPension > 0) {
    assumptions.push("Voluntary pension at HUF 1,560,000 annual cap");
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
