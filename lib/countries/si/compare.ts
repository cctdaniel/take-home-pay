import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { SICalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as SICalculatorInputs;
  const otherDependents =
    inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome
      ? 1
      : 0;
  const calculatorInputs: SICalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    age: inputs.assumptions.age,
    isResidentYoungWorker: inputs.assumptions.age < 29,
    isFullyDisabled: false,
    numberOfDependentChildren: Math.min(inputs.numberOfChildren, 10),
    numberOfSpecialCareChildren: 0,
    numberOfOtherDependents: otherDependents,
    mealReimbursementWorkdays: 0,
    transportReimbursementAnnual: 0,
    holidayAllowance: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
  const pensionLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .retirementContribution?.limit ?? 0;
  const retirementContribution = isMaxRetirement
    ? Math.min(pensionLimit, grossLocal)
    : 0;
  calculatorInputs.contributions.retirementContribution =
    retirementContribution;

  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied = retirementContribution > 0;

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
      ...buildAssumptionsSummary(country, inputs, retirementApplied),
      "Resident Slovenia employment model with 2026 allowances",
      calculatorInputs.numberOfDependentChildren > 0
        ? "Compare children mapped to ordinary dependent-child allowance"
        : "No dependent-child allowance",
      otherDependents > 0
        ? "No-income spouse mapped to one other dependent family member"
        : "No other dependent family-member allowance",
      calculatorInputs.isResidentYoungWorker
        ? "Resident young-worker allowance applied from compare age"
        : "No young-worker allowance",
      "No tax-exempt meal, commute, or holiday allowance entered in compare results.",
    ],
    calculation: result,
  };
};
