import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { BHCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as BHCalculatorInputs;
  const calculatorInputs: BHCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    workerType: "expatriate",
    sioBasicWageMonthly: 0,
    sioRecurringAllowancesMonthly: 0,
    sioContributoryWageMonthly: 0,
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
      "Bahrain compare assumes an expatriate employee with no personal income tax and the 1% employee unemployment insurance contribution on monthly cash wage, capped at BHD 4,000.",
      "Bahraini employee SIO is selectable on the Bahrain page but is not inferred from compare residency assumptions.",
      "No extra retirement amount is added because Bahrain salary has no personal income tax deduction to optimize; employee SIO is the modeled payroll deduction and employer end-of-service funding is not deducted from employee take-home pay.",
    ],
    calculation: result,
  };
};
