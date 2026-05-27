import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { SACalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as SACalculatorInputs;
  const calculatorInputs: SACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    workerType: "expatriate",
    gosiBasicWageMonthly: 0,
    housingAllowanceType: "none",
    cashHousingAllowanceMonthly: 0,
    gosiContributoryWageMonthly: 0,
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
      "Saudi Arabia compare assumes an expatriate employee with no personal income tax and no employee-side GOSI deduction.",
      "Saudi existing-system and 2026 new-system GOSI/SANED coverage, basic wage, housing allowance treatment, and monthly contributory wage are selectable on the Saudi Arabia page but are not inferred from compare residency assumptions.",
      "No extra retirement amount is added because Saudi employment earnings have no personal income tax deduction to optimize; GOSI/SANED coverage is a worker-type payroll setting.",
    ],
    calculation: result,
  };
};
