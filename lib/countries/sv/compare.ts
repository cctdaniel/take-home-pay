import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { SVCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as SVCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });
  const voluntaryAfpLimit =
    contributionLimits.retirementContribution?.limit ?? 0;
  const voluntaryAfp =
    isMaxRetirement && voluntaryAfpLimit > 0
      ? Math.min(voluntaryAfpLimit, grossLocal)
      : 0;
  const calculatorInputs: SVCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: voluntaryAfp,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied = voluntaryAfp > 0;

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
      "El Salvador compare uses the annualized monthly salary withholding table, ISSS, and mandatory AFP employee deductions.",
      retirementApplied
        ? "Voluntary AFP contribution is modeled at the configured maximum deduction."
        : "Voluntary AFP contribution is set to zero in compare results.",
      "Medical, education, worker-dues, and donation deductions are set to zero in compare because the compare questionnaire does not collect annual expense amounts or documentation facts.",
    ],
    calculation: result,
  };
};
