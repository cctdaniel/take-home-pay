import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { VNCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as VNCalculatorInputs;
  const inputs: VNCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
  };
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    "Personal deduction of 132M VND/year and 0 dependents",
    "Social insurance (8%), health insurance (1.5%), unemployment insurance (1%)",
    "Contribution ceiling at 20× base salary",
  ];

  if (isMaxRetirement) {
    assumptions.push("No voluntary retirement contributions modeled");
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
