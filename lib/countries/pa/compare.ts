import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { PACalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as PACalculatorInputs;
  const isMarried = inputs.maritalStatus === "married";
  const educationStudents = Math.min(
    10,
    Math.max(0, Math.floor(inputs.numberOfChildren)),
  );
  const contributionLimits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
    isMarried,
    educationStudents,
  });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: PACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    isMarried,
    educationStudents,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      educationExpenses: 0,
      medicalExpenses: 0,
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
      "Panama compare uses Panama-source employment salary with resident salary brackets.",
      isMarried
        ? "Married personal exemption applied from compare marital status."
        : "No married personal exemption",
      educationStudents > 0
        ? `${educationStudents} compare child${
            educationStudents > 1 ? "ren" : ""
          } mapped to the education-student count, with education expense amount left at zero.`
        : "No education-student deduction",
      retirementApplied
        ? "Max retirement maps to the approved retirement fund contribution cap."
        : "No approved retirement fund contribution",
      "Mortgage interest, medical expenses, education expenses, charity donations, and non-profit dues are left at zero in compare because the questionnaire does not collect those USD amounts.",
      inputs.assumptions.isResident
        ? "Resident salary assumptions used."
        : "Non-resident territorial-source analysis is not separately modeled yet for Panama; Panama-source salary model is used for comparability.",
    ],
    calculation: result,
  };
};
