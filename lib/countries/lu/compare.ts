import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { LUCalculatorInputs, LUTaxClass } from "./types";

function getLuxembourgTaxClass({
  maritalStatus,
  numberOfChildren,
  age,
}: {
  maritalStatus: "single" | "married";
  numberOfChildren: number;
  age: number;
}): LUTaxClass {
  if (maritalStatus === "married") {
    return "class2";
  }

  if (numberOfChildren > 0 || age >= 65) {
    return "class1a";
  }

  return "class1";
}

const TAX_CLASS_LABELS: Record<LUTaxClass, string> = {
  class1: "Class 1",
  class1a: "Class 1a",
  class2: "Class 2",
};

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
  const defaultInputs = getDefaultInputs(country) as LUCalculatorInputs;
  const taxClass = getLuxembourgTaxClass({
    maritalStatus: inputs.maritalStatus,
    numberOfChildren: inputs.numberOfChildren,
    age: inputs.assumptions.age,
  });
  const calculatorInputs: LUCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxClass,
    age: inputs.assumptions.age,
    numberOfChildren: Math.min(inputs.numberOfChildren, 10),
    claimSingleParentCredit:
      inputs.maritalStatus === "single" && inputs.numberOfChildren > 0,
    childSupportOrAllowancesReceived: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
  const pensionLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .retirementContribution?.limit ?? 0;
  const retirementContribution = isMaxRetirement
    ? Math.min(pensionLimit, grossLocal)
    : 0;
  calculatorInputs.contributions.retirementContribution =
    retirementContribution;

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
      `Luxembourg resident employee model using ${TAX_CLASS_LABELS[taxClass]}`,
      calculatorInputs.numberOfChildren > 0
        ? "Children mapped through the selected tax class"
        : "No child-based tax-class adjustment",
      calculatorInputs.age >= 65
        ? "Age mapped to class 1a where applicable"
        : "No age-based class 1a adjustment",
      calculatorInputs.claimSingleParentCredit
        ? "Luxembourg single-parent tax credit included with no child maintenance/allowance reduction"
        : "No Luxembourg single-parent tax credit",
    ],
    calculation: result,
  };
};
