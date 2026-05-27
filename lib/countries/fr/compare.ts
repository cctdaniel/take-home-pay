import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { FRCalculatorInputs, FRHouseholdStatus } from "./types";

function getHouseholdStatus(
  maritalStatus: "single" | "married",
  children: number,
): FRHouseholdStatus {
  if (maritalStatus === "married") {
    return "married_pacs";
  }

  return children > 0 ? "single_parent" : "single";
}

function calculateHouseholdParts(
  householdStatus: FRHouseholdStatus,
  children: number,
) {
  const base = householdStatus === "married_pacs" ? 2 : 1;
  const childParts = Math.min(children, 2) * 0.5 + Math.max(0, children - 2);
  const singleParentExtra =
    householdStatus === "single_parent" && children > 0 ? 0.5 : 0;
  return base + childParts + singleParentExtra;
}

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
  const defaultInputs = getDefaultInputs(country) as FRCalculatorInputs;
  const householdStatus = getHouseholdStatus(
    inputs.maritalStatus,
    inputs.numberOfChildren,
  );
  const taxHouseholdParts = calculateHouseholdParts(
    householdStatus,
    inputs.numberOfChildren,
  );
  const calculatorLimits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
  });
  const retirementSavings =
    inputs.assumptions.retirementContributions === "max"
      ? Math.min(calculatorLimits.retirementSavings.limit, grossLocal)
      : 0;
  const calculatorInputs: FRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableBenefitsInKind: 0,
    householdStatus,
    numberOfChildren: inputs.numberOfChildren,
    taxHouseholdParts,
    professionalExpenseMethod: "standard_10_percent",
    impatriateRegime: "none",
    impatriatePremiumAmount: 0,
    frenchReferenceSalary: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementSavings,
      actualProfessionalExpenses: 0,
      charitableDonations: 0,
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
      ...buildAssumptionsSummary(country, inputs, retirementSavings > 0),
      "Ordinary resident employee model for France",
      `Family quotient parts: ${taxHouseholdParts}`,
      "Automatic 10% professional expense deduction",
      "No taxable avantages en nature entered in compare",
      "No charitable donations or actual professional expenses in compare",
      "French impatriate salary-premium regime left off in compare because it depends on eligibility, contract wording, and a French reference-salary floor",
    ],
    calculation: result,
  };
};
