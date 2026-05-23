import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { ATCalculatorInputs, ATFamilyBonusChildren } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as ATCalculatorInputs;
  const calculatorInputs: ATCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    familyBonusChildren: Math.min(
      inputs.numberOfChildren,
      4,
    ) as ATFamilyBonusChildren,
  };
  const result = calculateNetSalary(calculatorInputs);
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
    assumptions: [
      ...buildAssumptionsSummary(country, inputs, false),
      "Ordinary resident employee model for Austria",
      inputs.numberOfChildren > 0
        ? "Family Bonus Plus children mapped from compare profile"
        : "No modeled Family Bonus Plus children",
      "No modeled commuter allowance in compare",
    ],
    calculation: result,
  };
};
