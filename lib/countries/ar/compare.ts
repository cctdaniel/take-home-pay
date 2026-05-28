import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { AR_VOLUNTARY_RETIREMENT_MAX_RATE } from "./constants/tax-year-2026";
import type { ARCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ARCalculatorInputs;
  const voluntaryRetirement = isMaxRetirement
    ? grossLocal * AR_VOLUNTARY_RETIREMENT_MAX_RATE
    : 0;
  const calculatorInputs: ARCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    hasSpouse: inputs.maritalStatus === "married",
    children: inputs.numberOfChildren,
    contributions: { voluntaryRetirement },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Family deductions mapped from compare spouse/children",
  ];
  if (voluntaryRetirement > 0) {
    assumptions.push("Voluntary retirement at 12% of gross cap");
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
