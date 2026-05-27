import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { MU_PERSONAL_PENSION_LIMIT } from "./constants/tax-year-2026";
import type { MUCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as MUCalculatorInputs;
  const numberOfDependents = Math.min(inputs.numberOfChildren, 4);
  const retirementContribution = isMaxRetirement
    ? Math.min(MU_PERSONAL_PENSION_LIMIT, grossLocal)
    : 0;
  const calculatorInputs: MUCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfDependents,
    numberOfPrivateSchoolDependents: 0,
    numberOfTertiaryEducationDependents: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      insurancePremiums: 0,
      charitableDonations: 0,
      educationExpenses: 0,
      tertiaryEducationExpenses: 0,
      carerWages: 0,
      housingExpenses: 0,
      qualifyingExpenses: 0,
    },
  };
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
      "Resident employee model for Mauritius",
      numberOfDependents > 0
        ? "Dependent deduction mapped from compare children"
        : "No dependent deduction",
      "Medical, charity, school-fee, tertiary-education, carer-wage, housing, and green-investment reliefs left at zero in compare",
    ],
    calculation: result,
  };
};
