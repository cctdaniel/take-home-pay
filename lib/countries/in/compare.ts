import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { INCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as INCalculatorInputs;
  const inputs: INCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
  };
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    "New tax regime (default) with standard deduction of 75,000 INR",
    "4% health & education cess applied",
    "No EPF contribution modeled",
  ];

  if (isMaxRetirement) {
    assumptions.push("No NPS or additional retirement contributions modeled");
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
