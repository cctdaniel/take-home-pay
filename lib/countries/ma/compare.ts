import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { MACalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as MACalculatorInputs;
  const numberOfDependents = Math.min(inputs.numberOfChildren, 6);
  const calculatorInputs: MACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfDependents,
    firstEmploymentExemption: false,
    cnssAmoMonthlyWage: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      housingExpenses: 0,
      charitableDonations: 0,
    },
  };
  const retirementLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .retirementContribution?.limit ?? 0;
  const retirementContribution = isMaxRetirement
    ? Math.min(retirementLimit, grossLocal)
    : 0;
  calculatorInputs.contributions.retirementContribution = retirementContribution;

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
      "Ordinary resident employee model for Morocco",
      numberOfDependents > 0
        ? "Family charge reductions mapped from compare children"
        : "No family charge reduction",
      "First-employment IR exemption not applied in compare",
      "Main-home mortgage interest and charitable deductions left at zero in compare",
    ],
    calculation: result,
  };
};
