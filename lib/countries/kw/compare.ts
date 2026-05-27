import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { KWCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as KWCalculatorInputs;
  const calculatorInputs: KWCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    workerType: "expatriate",
    sector: "government",
    pifssInsurableSalaryMonthly: 0,
    pifssBasicSalaryMonthly: 0,
    pifssSupplementarySalaryMonthly: 0,
    includeFinancialRemuneration: false,
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
      "Kuwait compare assumes an expatriate employee with no personal income tax and no local employee social security deduction.",
      "Kuwaiti employee PIFSS coverage, basic and supplementary insurance salaries, private/oil-sector unemployment insurance, and conditional financial-remuneration contribution are selectable on the Kuwait page but are not inferred from compare residency assumptions.",
      "No extra retirement amount is added because Kuwait salary has no personal income tax deduction to optimize; PIFSS is modeled as worker-type payroll coverage rather than optional tax relief.",
    ],
    calculation: result,
  };
};
