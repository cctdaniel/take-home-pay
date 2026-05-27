import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { ECCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ECCalculatorInputs;
  const calculatorInputs: ECCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    familyDependents: Math.min(inputs.numberOfChildren, 5),
    hasDisabilityOrCatastrophicIllness: false,
    incomeExemptionType: "none",
    contributions: {
      ...defaultInputs.contributions,
      qualifyingExpenses: 0,
    },
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
      "Ecuador comparison uses resident salary income with standard IESS employee contribution.",
      inputs.numberOfChildren > 0
        ? "Family dependents are mapped to the SRI personal-expense basket schedule, but qualifying expenses are left at zero."
        : "No registered family dependents or personal-expense rebate amount assumed.",
      "No older-adult or disability/sustituto income exemption is assumed in compare.",
    ],
    calculation: result,
  };
};
