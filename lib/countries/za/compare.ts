import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { ZAAgeBand, ZACalculatorInputs } from "./types";

function getAgeBand(age: number): ZAAgeBand {
  if (age >= 75) {
    return "age75plus";
  }

  if (age >= 65) {
    return "age65to74";
  }

  return "under65";
}

function getMedicalSchemeMembers({
  hasPrivateHealthInsurance,
  maritalStatus,
  spouseHasNoIncome,
  numberOfChildren,
}: {
  hasPrivateHealthInsurance: boolean;
  maritalStatus: "single" | "married";
  spouseHasNoIncome: boolean;
  numberOfChildren: number;
}) {
  if (!hasPrivateHealthInsurance) {
    return 0;
  }

  return Math.min(
    20,
    1 +
      (maritalStatus === "married" && spouseHasNoIncome ? 1 : 0) +
      Math.max(0, Math.floor(numberOfChildren)),
  );
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
  const defaultInputs = getDefaultInputs(country) as ZACalculatorInputs;
  const ageBand = getAgeBand(inputs.assumptions.age);
  const medicalSchemeMembers = getMedicalSchemeMembers({
    hasPrivateHealthInsurance: inputs.assumptions.hasPrivateHealthInsurance,
    maritalStatus: inputs.maritalStatus,
    spouseHasNoIncome: inputs.assumptions.spouseHasNoIncome,
    numberOfChildren: inputs.numberOfChildren,
  });
  const contributionLimits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
    ageBand,
    medicalSchemeMembers,
  });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: ZACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableNonCashBenefits: 0,
    ageBand,
    medicalSchemeMembers,
    hasDisabilityInFamily: false,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      insurancePremiums: 0,
      charitableDonations: 0,
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
      "South Africa compare uses the ordinary SARS resident employment salary model.",
      ageBand === "age75plus"
        ? "Age 75+ tertiary age rebate applied from compare age."
        : ageBand === "age65to74"
          ? "Age 65-74 secondary age rebate applied from compare age."
          : "Primary rebate only; no age rebate.",
      medicalSchemeMembers > 0
        ? `Private-health assumption maps to ${medicalSchemeMembers} medical scheme member${
            medicalSchemeMembers > 1 ? "s" : ""
          } for the fixed SARS medical scheme fees tax credit.`
        : "No medical scheme fees tax credit",
      retirementApplied
        ? "Max retirement maps to the SARS retirement fund deduction limit."
        : "No retirement fund contribution",
      "Annual medical scheme fees, out-of-pocket medical expenses, disability AMTC status, and Section 18A donations are left at zero in compare because the questionnaire does not collect those amounts.",
      "No taxable fringe benefits entered in compare.",
      inputs.assumptions.isResident
        ? "Resident tax assumptions used."
        : "Non-resident treatment is not separately modeled yet for South Africa; resident employment model is used for comparability.",
    ],
    calculation: result,
  };
};
