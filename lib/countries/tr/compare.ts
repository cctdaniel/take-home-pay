import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { TRCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as TRCalculatorInputs;
  const calculatorInputs: TRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    disabilityDegree: "none",
    donationReliefCategory: "none",
    contributions: {
      ...defaultInputs.contributions,
      insurancePremiums: 0,
      qualifyingExpenses: 0,
      educationExpenses: 0,
      charitableDonations: 0,
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
      "Ordinary resident employee model for Turkey",
      "Disability allowance left at none in compare",
      "Private insurance premium deduction left at zero in compare",
      "Union dues, education/health expenses, and donation relief are left at zero in compare because the questionnaire does not collect Turkish receipt or donation-category amounts.",
      isMaxRetirement
        ? "Max-retirement mode does not add a Turkey retirement amount because the modeled salary deduction is private insurance, not a separate retirement top-up."
        : "No retirement contribution selected",
    ],
    calculation: result,
  };
};
