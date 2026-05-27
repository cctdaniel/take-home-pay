import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import { CO_ARTICLE_336_DEPENDENT_MAX } from "./constants/tax-year-2026";
import type { COCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as COCalculatorInputs;
  const dependentCount = Math.min(
    CO_ARTICLE_336_DEPENDENT_MAX,
    Math.max(
      0,
      Math.floor(inputs.numberOfChildren) +
        (inputs.maritalStatus === "married" &&
        inputs.assumptions.spouseHasNoIncome
          ? 1
          : 0),
    ),
  );
  const contributionLimits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
    numberOfDependents: dependentCount,
  });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: COCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfDependents: dependentCount,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      insurancePremiums: 0,
      housingExpenses: 0,
      qualifyingExpenses: 0,
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
      "Colombia compare uses the resident employment-income model with the 2026 UVT and SMLMV assumptions.",
      dependentCount > 0
        ? `Mapped ${dependentCount} compare dependent${
            dependentCount > 1 ? "s" : ""
          } to the Article 387 and Article 336 dependent deductions.`
        : "No dependent deduction",
      retirementApplied
        ? "Max retirement maps to voluntary pension/AFC savings within the configured 30% and cédula general caps."
        : "No voluntary pension/AFC savings",
      inputs.assumptions.hasPrivateHealthInsurance
        ? "Private health flag noted, but prepaid-health amount is left at zero because compare does not collect a COP premium amount."
        : "Prepaid health, housing interest, and electronic-invoice deductions left at zero in compare.",
      inputs.assumptions.isResident
        ? "Resident tax scale applied."
        : "Non-resident treatment is not separately modeled yet for Colombia; resident employment model is used for comparability.",
    ],
    calculation: result,
  };
};
