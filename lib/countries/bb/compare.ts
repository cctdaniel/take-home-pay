import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type {
  BBAgeAllowanceStatus,
  BBCalculatorInputs,
  BBResidencyStatus,
} from "./types";

function getAgeAllowanceStatus(age: number): BBAgeAllowanceStatus {
  if (age >= 60) {
    return "pensioner60Plus";
  }

  if (age >= 40) {
    return "age40Plus";
  }

  return "standard";
}

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
  const defaultInputs = getDefaultInputs(country) as BBCalculatorInputs;
  const residencyStatus: BBResidencyStatus = inputs.assumptions.isResident
    ? "resident"
    : "nonResident";
  const isResident = residencyStatus === "resident";
  const ageAllowanceStatus = isResident
    ? getAgeAllowanceStatus(inputs.assumptions.age)
    : "standard";
  const hasEligibleSpouse =
    isResident &&
    inputs.maritalStatus === "married" &&
    inputs.assumptions.spouseHasNoIncome;
  const calculatorInputs: BBCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyStatus,
    ageAllowanceStatus,
    hasEligibleSpouse,
    charityType: "registeredNonExempt",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
    },
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
      ...buildAssumptionsSummary(country, inputs, false),
      isResident
        ? "Resident Barbados allowances and annual-return deduction eligibility are used."
        : "Non-resident Barbados-source salary is modeled without resident allowances or resident deductions.",
      ageAllowanceStatus === "pensioner60Plus"
        ? "Age 60+ pensioner allowance applied from compare age."
        : ageAllowanceStatus === "age40Plus"
          ? "Age 40+ status enables medical-exam deduction eligibility, but compare expense amount is left at zero."
          : "Standard personal allowance",
      hasEligibleSpouse
        ? "Spouse allowance applied from married/spouse-no-income assumptions."
        : "No spouse allowance",
      inputs.numberOfChildren > 0
        ? "Barbados has no modeled salary child allowance in this calculator, so compare children do not change Barbados PAYE."
        : "No child allowance",
      isMaxRetirement
        ? "Max-retirement mode does not add a Barbados retirement amount because the reviewed BRA/NIS guidance does not provide a general employee salary deduction; annual-return expense deductions are left at zero in compare."
        : "Annual-return medical, union, charity, and renewable-energy deductions are left at zero in compare.",
    ],
    calculation: result,
  };
};
