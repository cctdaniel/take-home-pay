import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { AL_VOLUNTARY_PENSION_DEDUCTION_LIMIT } from "./constants/tax-year-2026";
import type { ALCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ALCalculatorInputs;
  const retirementContribution = isMaxRetirement
    ? Math.min(AL_VOLUNTARY_PENSION_DEDUCTION_LIMIT, grossLocal)
    : 0;
  const numberOfDependentChildren = Math.min(inputs.numberOfChildren, 10);
  const calculatorInputs: ALCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    taxableNonCashBenefits: 0,
    payFrequency,
    appliesEmploymentAllowance: true,
    claimsFamilyDivaDeductions: true,
    numberOfDependentChildren,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      educationExpenses: 0,
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
      "Ordinary resident employee model for Albania with the employment allowance applied",
      "Compare assumes no taxable benefits in kind",
      numberOfDependentChildren > 0
        ? "DIVA dependent-child deductions mapped from compare children and assumed claimable by this taxpayer"
        : "No DIVA dependent-child deduction",
      "Children's education expense deduction is left at zero in compare because it depends on actual family education spending",
    ],
    calculation: result,
  };
};
