import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { BACalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as BACalculatorInputs;
  const hasDependentSpouse =
    inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome;
  const dependentChildren = Math.max(0, Math.floor(inputs.numberOfChildren));
  const calculatorInputs: BACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    entity: "fbih",
    hasDependentSpouse,
    dependentChildren,
    dependentParents: 0,
    otherDependents: 0,
    bdDisabilityPercent: 0,
    bdPermanentDisability: false,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      mortgageInterest: 0,
      lifeInsurancePremium: 0,
      educationExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs as CalculatorInputs);

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
      ...buildAssumptionsSummary(country, inputs, false),
      "Federation of BiH payroll model used for compare",
      hasDependentSpouse
        ? "FBiH dependent spouse allowance applied"
        : "No FBiH dependent spouse allowance",
      dependentChildren > 0
        ? `${dependentChildren} FBiH child allowance${
            dependentChildren > 1 ? "s" : ""
          } mapped from compare children`
        : "No FBiH child allowance",
      "No mortgage, insurance, education, or capped entity deduction entered in compare",
      ...(isMaxRetirement
        ? [
            "Max-retirement mode does not add a Bosnia and Herzegovina retirement amount because compare uses the FBiH payroll scenario and leaves entity-specific capped deductions at zero.",
          ]
        : []),
    ],
    calculation: result,
  };
};
