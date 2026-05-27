import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { CW_TAX_CONFIG } from "./constants/tax-year-2026";
import type { CWCalculatorInputs, CWTaxResidencyType } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as CWCalculatorInputs;
  const taxResidency: CWTaxResidencyType = inputs.assumptions.isResident
    ? "resident"
    : "foreign_taxpayer";
  const isResident = taxResidency === "resident";
  const retirementLimit =
    CW_TAX_CONFIG.voluntaryContributions.find(
      (contribution) => contribution.key === "retirementContribution",
    )?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const childAllowanceCategoryIV = isResident
    ? Math.min(Math.max(0, Math.floor(inputs.numberOfChildren)), 10)
    : 0;
  const isMarriedSingleEarner =
    isResident &&
    inputs.maritalStatus === "married" &&
    inputs.assumptions.spouseHasNoIncome;
  const isAge60OrOlder = isResident && inputs.assumptions.age >= 60;
  const calculatorInputs: CWCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxResidency,
    isMarriedSingleEarner,
    isAge60OrOlder,
    hasTransferredElderlyAllowance: false,
    childAllowanceCategoryI: 0,
    childAllowanceCategoryII: 0,
    childAllowanceCategoryIII: 0,
    childAllowanceCategoryIV,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
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
      isResident
        ? "Curaçao resident wage-tax credits and social premiums are applied."
        : "Foreign taxpayer model excludes resident wage-tax credits and resident social premiums.",
      isMarriedSingleEarner
        ? "Single-earner allowance applied from spouse-no-income assumption."
        : "No single-earner allowance",
      childAllowanceCategoryIV > 0
        ? "Compare children mapped to Curaçao child allowance category IV; study-abroad and higher-education categories are left at zero."
        : "No child allowance category selected",
      isAge60OrOlder
        ? "Elderly allowance applied from age assumption."
        : "No elderly allowance",
      "Transferred elderly and transferred child allowances are left at zero in compare because they require spouse-specific annual-return facts.",
    ],
    calculation: result,
  };
};
