import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { JPCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as JPCalculatorInputs;
  const inputs: JPCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
  };
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    "Employment income deduction applied automatically based on gross salary",
    "National income tax (5–45%), reconstruction surtax (2.1%), and resident tax (10%)",
    "Social insurance at national average rates (pension ~9.15%, health ~5%, employment 0.6%)",
  ];

  if (isMaxRetirement) {
    assumptions.push("No iDeCo or additional retirement contributions modeled");
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
