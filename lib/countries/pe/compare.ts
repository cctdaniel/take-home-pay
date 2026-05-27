import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { PECalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as PECalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });

  const calculatorInputs: PECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    salaryPackageMode: "includedInGross",
    gratificationHealthCoverage: "essalud",
    pensionSystem: "onp",
    afpCommissionMode: "flow",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
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
      "Peru compare treats gross as a private-sector annual cash package that already includes the two statutory gratifications and EsSalud extraordinary bonus.",
      "ONP/SNP is used for the pension assumption; choose Peru directly to model AFP Habitat, Integra, Prima, or Profuturo.",
      ...(isMaxRetirement
        ? [
            "Max-retirement mode does not add a Peru retirement amount because compare uses pension system selection rather than a free-form annual retirement deduction.",
          ]
        : []),
      contributionLimits.qualifyingExpenses
        ? `${contributionLimits.qualifyingExpenses.name} is left at 0 in compare because it depends on documented annual-return expenses.`
        : "No Peru retirement amount is added in compare because the salary model uses pension system selection rather than a free-form annual retirement deduction.",
    ],
    calculation: result,
  };
};
