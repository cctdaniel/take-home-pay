import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { BSCalculatorInputs, BSNibCategory } from "./types";

function getNibCategory(age: number): BSNibCategory {
  return age >= 65 ? "age65PlusNotRetired" : "standard";
}

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as BSCalculatorInputs;
  const nibCategory = getNibCategory(inputs.assumptions.age);
  const calculatorInputs: BSCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    nibCategory,
    nibInsurableWeeklyWage: 0,
    weeklyFormalGratuities: 0,
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
      "The Bahamas compare uses the no-personal-income-tax employment model with employee National Insurance.",
      nibCategory === "age65PlusNotRetired"
        ? "Age 65+ mapped to the modeled age 65+ not receiving Retirement Benefit NIB category."
        : "Standard employee NIB category",
      isMaxRetirement
        ? "Max-retirement mode does not add a Bahamas amount because ordinary salary has no personal income tax deduction; employee NIB is the modeled payroll deduction."
        : "No additional Bahamas salary deduction is applied in compare.",
      "No formal tips or gratuities are entered in compare; the Bahamas page can model them separately when they are part of gross salary.",
      "Retirement Benefit recipient and summer-employment employer-only categories are selectable on the Bahamas page, not assumed in compare.",
    ],
    calculation: result,
  };
};
