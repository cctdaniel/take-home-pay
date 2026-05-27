import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { LTCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as LTCalculatorInputs;
  const calculatorInputs: LTCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    secondPillarRate: "0",
    disabilityNpdType: "none",
  };
  const retirementLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .retirementContribution?.limit ?? 0;

  if (isMaxRetirement) {
    calculatorInputs.contributions = {
      ...calculatorInputs.contributions,
      retirementContribution: retirementLimit,
      insurancePremiums: 0,
      educationExpenses: 0,
    };
  }

  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied = isMaxRetirement && retirementLimit > 0;

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
      "Ordinary resident employee model for Lithuania",
      "Second-pillar pension accumulation left at 0% in compare",
      "Ordinary NPD formula used; no disability or participation-level NPD selected",
      retirementApplied
        ? "Max retirement applies the Article 21 additional pension deduction"
        : "No Article 21 pension, insurance, or study deduction selected",
    ],
    calculation: result,
  };
};
