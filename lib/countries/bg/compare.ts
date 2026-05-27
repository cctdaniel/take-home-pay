import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { BGCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as BGCalculatorInputs;
  const numberOfChildren = Math.min(inputs.numberOfChildren, 10);
  const calculatorInputs: BGCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfChildren,
    numberOfDisabledChildren: 0,
    hasReducedWorkingCapacity: false,
    donationReliefCategory: "general_5",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
    },
  };
  const retirementLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .retirementContribution?.limit ?? 0;

  if (isMaxRetirement) {
    calculatorInputs.contributions.retirementContribution = Math.min(
      retirementLimit,
      grossLocal,
    );
  }

  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied =
    calculatorInputs.contributions.retirementContribution > 0;

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
      "Ordinary resident employee model for Bulgaria",
      numberOfChildren > 0
        ? "Child tax relief mapped from compare profile"
        : "No child tax relief",
      "Disabled-child relief left at zero in compare",
      "Personal reduced-working-capacity relief left off in compare",
      retirementApplied
        ? "Max-retirement scenario applies modeled Article 19 voluntary pension/social insurance relief"
        : "No voluntary pension/social insurance, health/life insurance, or donation relief entered in compare",
    ],
    calculation: result,
  };
};
