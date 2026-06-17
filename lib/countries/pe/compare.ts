import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  PE_APV_ANNUAL_CAP,
  PE_APV_MAX_GROSS_RATE,
} from "./constants/tax-year-2026";
import type { PECalculatorInputs } from "./types";
import { roundCurrency } from "../calculator-utils";

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
  const apv = isMaxRetirement
    ? Math.min(PE_APV_ANNUAL_CAP, roundCurrency(grossLocal * PE_APV_MAX_GROSS_RATE))
    : 0;
  const calculatorInputs: PECalculatorInputs = {
    ...(getDefaultInputs(country) as PECalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { apv },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "13% employee pension; 7 UIT deduction; progressive fifth-category PIT",
  ];
  if (apv > 0) {
    assumptions.push("AFP voluntary contribution (APV) at min(8% gross, 41 UIT) cap");
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
