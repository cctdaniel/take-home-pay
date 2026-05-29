import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { AECalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as AECalculatorInputs;
  const employeeCategory = "foreign_expat";
  const aeInputs: AECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employeeCategory,
    contributions: {},
  };
  const result = calculateNetSalary(aeInputs);
  const assumptions = [
    "Foreign / expat employee; UAE nationality pension is not assumed",
    "No personal income tax on wages",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      "No income tax on salary; voluntary contributions do not reduce wage tax",
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
