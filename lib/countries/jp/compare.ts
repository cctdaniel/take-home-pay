import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { JPCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs: comparisonInputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as JPCalculatorInputs;
  const inputs: JPCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    spouseDeductionType:
      comparisonInputs.maritalStatus === "married" &&
      comparisonInputs.assumptions.spouseHasNoIncome
        ? "ordinary"
        : "none",
    hasIncomeAdjustmentDeduction: comparisonInputs.numberOfChildren > 0,
    donationType: "none",
    contributions: {
      ...defaultInputs.contributions,
      idecoContribution: 0,
      lifeInsurancePremiums: 0,
      careMedicalInsurancePremiums: 0,
      privatePensionInsurancePremiums: 0,
      earthquakeInsurancePremiums: 0,
      medicalExpenses: 0,
      medicalExpenseReimbursements: 0,
      qualifiedDonations: 0,
    },
  };
  const idecoLimit =
    getCountryCalculator(country).getContributionLimits(inputs)
      .idecoContribution?.limit ?? 0;
  const idecoContribution = isMaxRetirement
    ? Math.min(idecoLimit, grossLocal)
    : 0;
  inputs.contributions.idecoContribution = idecoContribution;

  const result = calculateNetSalary(inputs);
  const retirementApplied = idecoContribution > 0;
  const assumptions: string[] = [
    ...buildAssumptionsSummary(country, comparisonInputs, retirementApplied),
    "Employment income deduction and 2025+ basic deduction applied automatically",
    inputs.spouseDeductionType === "ordinary"
      ? "Ordinary spouse deduction mapped from no-income spouse assumption"
      : "No spouse deduction",
    comparisonInputs.numberOfChildren > 0
      ? "Children mapped to high-income under-23 income-adjustment eligibility only; no age-specific dependent deduction assumed"
      : "No dependent deduction",
    "National income tax (5-45%), reconstruction surtax (2.1%), and resident tax (10%)",
    "Social insurance at national average rates (pension ~9.15%, health ~5%, employment 0.6%)",
    "No life-insurance, earthquake-insurance, medical-expense, or donation deduction amounts are entered in compare; the Japan page models them separately",
  ];

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
    assumptions,
    calculation: result,
  };
};
