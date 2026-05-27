import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { OMCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as OMCalculatorInputs;
  const calculatorInputs: OMCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    workerType: "expatriate",
    spfInsuredWageMonthly: 0,
    expatProvidentSchemeApplied: false,
    expatProvidentBasicWageMonthly: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
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
      "Oman compare assumes an expatriate employee with no 2026 personal income tax and no employee-side Oman social protection deduction.",
      "Omani employee social-protection coverage, employer provident-scheme enrollment, basic wage, and optional SPF savings deposits are selectable on the Oman page but are not inferred from compare residency assumptions.",
      "No max-retirement amount is added because Oman has no 2026 salary personal income tax deduction to optimize; optional SPF savings deposits are modeled as cash savings, not tax relief.",
    ],
    calculation: result,
  };
};
