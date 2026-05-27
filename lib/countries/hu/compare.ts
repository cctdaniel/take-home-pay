import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { HU_VOLUNTARY_PENSION_CONTRIBUTION_FOR_MAX_CREDIT } from "./constants/tax-year-2026";
import type { HUCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as HUCalculatorInputs;
  const retirementContribution = isMaxRetirement
    ? Math.min(HU_VOLUNTARY_PENSION_CONTRIBUTION_FOR_MAX_CREDIT, grossLocal)
    : 0;
  const beneficiaryDependents = Math.min(inputs.numberOfChildren, 10);
  const totalDependents = beneficiaryDependents;
  const calculatorInputs: HUCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    pitBaseAllowance: "none",
    claimPersonalAllowance: false,
    claimFirstMarriageAllowance: false,
    beneficiaryDependents,
    totalDependents,
    claimFamilyContributionAllowance: true,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
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
      "Ordinary resident employee model for Hungary",
      beneficiaryDependents > 0
        ? "Family tax and contribution allowances mapped from compare children"
        : "No family tax allowance",
      "Mother, under-25, personal, and first-marriage allowances left off; use the Hungary page when eligible",
    ],
    calculation: result,
  };
};
