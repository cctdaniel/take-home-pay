import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { JOCalculatorInputs } from "./types";

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
  const hasResidentDependents =
    inputs.maritalStatus === "married" || inputs.numberOfChildren > 0;
  const defaultInputs = getDefaultInputs(country) as JOCalculatorInputs;
  const calculatorInputs: JOCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    hasResidentDependents,
    sscMonthlyWage: 0,
    contributions: {
      ...defaultInputs.contributions,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      charitableDonations: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs as CalculatorInputs);

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
      "Ordinary resident employee model for Jordan",
      hasResidentDependents
        ? "Resident-dependant exemption applied"
        : "No resident-dependant exemption",
      "Personal expense and donation deductions left at zero in compare",
      "No Jordan retirement amount is added in compare because the modeled salary deductions are personal expense and donation items.",
    ],
    calculation: result,
  };
};
