import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { KHCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as KHCalculatorInputs;
  const hasDependentSpouse =
    inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome;
  const dependentChildren = Math.min(inputs.numberOfChildren, 4);
  const calculatorInputs: KHCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxResidency: "resident",
    hasDependentSpouse,
    dependentChildren,
    taxableFringeBenefits: 0,
    nssfMonthlyWage: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
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
      "Ordinary resident employee model for Cambodia",
      "No taxable fringe benefits entered in compare",
      hasDependentSpouse
        ? "Dependent spouse allowance applied"
        : "No dependent spouse allowance",
      dependentChildren > 0
        ? `${dependentChildren} child allowance${
            dependentChildren > 1 ? "s" : ""
          } applied`
        : "No child allowance",
      "No extra retirement amount is added because the reviewed GDT/NSSF salary guidance does not make voluntary pension top-ups a general employee salary deduction.",
    ],
    calculation: result,
  };
};
