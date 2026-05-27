import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { QACalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as QACalculatorInputs;
  const calculatorInputs: QACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employeeType: "expatriate",
    contributionSalaryCapTreatment: "standardCap",
    grsiaBasicSalaryMonthly: 0,
    grsiaSocialAllowanceMonthly: 0,
    grsiaHousingAllowanceMonthly: 0,
    grsiaContributionSalaryMonthly: 0,
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
      "Qatar compare assumes an expatriate employee with no personal income tax and no employee-side Qatar social insurance deduction.",
      "Qatari/GCC pension-covered social insurance is selectable on the Qatar page with monthly GRSIA basic salary, social allowance, and housing allowance components, but it is not inferred from compare residency assumptions.",
      "No extra retirement amount is added because Qatar salary has no personal income tax deduction to optimize; GRSIA coverage is a worker-type payroll setting.",
    ],
    calculation: result,
  };
};
