import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { VNCalculatorInputs } from "../types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs: comparisonInputs,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as VNCalculatorInputs;
  const inputs: VNCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyStatus: comparisonInputs.assumptions.isResident
      ? "resident"
      : "nonResident",
    insuranceCoverage: "foreignCovered",
    numberOfDependents: comparisonInputs.assumptions.isResident
      ? Math.min(Math.max(comparisonInputs.numberOfChildren, 0), 10)
      : 0,
    contributions: {
      voluntaryPensionContribution: 0,
      charitableDonations: 0,
    },
  };
  const pensionLimit =
    getCountryCalculator(country).getContributionLimits(inputs)
      .voluntaryPensionContribution?.limit ?? 0;
  const retirementContribution = isMaxRetirement
    ? Math.min(pensionLimit, grossLocal)
    : 0;
  inputs.contributions.voluntaryPensionContribution = retirementContribution;
  const result = calculateNetSalary(inputs);
  const assumptions: string[] = [
    comparisonInputs.assumptions.isResident
      ? "Resident progressive PIT using 2026 five-band salary/wage table and modeled dependents"
      : "Non-resident 20% employment income tax with no family deductions",
    "Foreign employee assumption: social insurance (8%) and health insurance (1.5%), no unemployment insurance",
    "Social and health contribution ceiling at 20× base salary",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      retirementContribution > 0
        ? "Retirement: max - max-retirement scenario applies the modeled voluntary pension deduction cap"
        : "Max-retirement mode does not add a Vietnam voluntary pension deduction for this comparison scenario",
    );
  } else {
    assumptions.push(
      "No voluntary pension or approved charity deductions entered in compare results",
    );
  }

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
