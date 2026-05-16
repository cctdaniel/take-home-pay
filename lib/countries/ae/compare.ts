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
  inputs,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as AECalculatorInputs;
  const employeeCategory = inputs.assumptions.isResident
    ? "uae_national_new_private"
    : "foreign_expat";
  const aeInputs: AECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employeeCategory,
    contributions: {},
  };
  const result = calculateNetSalary(aeInputs);
  const assumptions = [
    employeeCategory === "foreign_expat"
      ? "Foreign / expat employee"
      : "UAE national, private sector Law 57/2023",
    "No personal income tax on wages",
  ];

  if (isMaxRetirement) {
    assumptions.push("No voluntary retirement tax relief modeled for UAE salary");
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
