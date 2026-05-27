import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { ITCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ITCalculatorInputs;
  const calculatorInputs: ITCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableFringeBenefits: 0,
    dependentSpouse:
      inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome,
    eligibleChildren:
      inputs.numberOfChildren > 0 && !inputs.assumptions.hasYoungChildren
        ? inputs.numberOfChildren
        : 0,
    childCreditShare:
      inputs.maritalStatus === "married" && !inputs.assumptions.spouseHasNoIncome
        ? "half"
        : "full",
    cohabitingAscendants: 0,
    ascendantCreditSharePercent: 100,
  };
  const pensionLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .pensionContribution.limit;
  const retirementApplied =
    inputs.assumptions.retirementContributions === "max";
  calculatorInputs.contributions = {
    pensionContribution: retirementApplied ? pensionLimit : 0,
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
      ...buildAssumptionsSummary(country, inputs, retirementApplied),
      "Ordinary resident employee model for Italy",
      retirementApplied
        ? "Max modeled supplementary pension contribution"
        : "No modeled supplementary pension contribution",
      "No Italy impatriate-worker regime assumed in compare",
      "No taxable fringe benefits entered in compare",
      inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome
        ? "Dependent spouse Article 12 credit included"
        : "No dependent spouse credit assumed",
      inputs.numberOfChildren > 0 && inputs.assumptions.hasYoungChildren
        ? "Italy child tax credit not applied for children under 21 in this salary model"
        : inputs.numberOfChildren > 0
          ? "Children treated as Article 12 eligible age 21-29 or disabled age 30+"
          : "No eligible child credit assumed",
      "No cohabiting ascendant credit assumed in compare",
    ],
    calculation: result,
  };
};
