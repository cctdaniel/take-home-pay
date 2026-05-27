import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import {
  AD_CASS_EMPLOYEE_RATE,
  AD_EMPLOYMENT_EXPENSE_RATE,
  AD_PENSION_DEDUCTION_LIMIT,
} from "./constants/tax-year-2026";
import type { ADCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ADCalculatorInputs;
  const maxRetirement =
    isMaxRetirement && grossLocal > 0
      ? Math.min(
          AD_PENSION_DEDUCTION_LIMIT,
          Math.max(
            0,
            grossLocal -
              grossLocal * AD_CASS_EMPLOYEE_RATE -
              grossLocal * AD_EMPLOYMENT_EXPENSE_RATE,
          ) * 0.3,
          grossLocal,
        )
      : 0;
  const numberOfFamilyDependents = Math.min(inputs.numberOfChildren, 10);
  const hasNonWorkingSpouseOrPartner =
    inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome;
  const calculatorInputs: ADCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    hasNonWorkingSpouseOrPartner,
    isDisabledTaxpayer: false,
    numberOfFamilyDependents,
    numberOfDisabledDependents: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: maxRetirement,
      housingExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied = maxRetirement > 0;

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
      "Ordinary resident employee model for Andorra",
      hasNonWorkingSpouseOrPartner
        ? "Non-working spouse/partner personal minimum selected"
        : "Single-taxpayer personal minimum selected",
      numberOfFamilyDependents > 0
        ? "Family dependent reductions mapped from compare children"
        : "No family dependent reduction",
      "Principal-residence mortgage relief left at zero in compare",
    ],
    calculation: result,
  };
};
