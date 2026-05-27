import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { AMCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as AMCalculatorInputs;
  const calculatorInputs: AMCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    pensionParticipation: "funded_pension",
    healthInsuranceStatus: "applies",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      tertiaryEducationExpenses: 0,
      medicalExpenses: 0,
      educationExpenses: 0,
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
      "Armenia comparison uses an ordinary resident employee with funded pension participation, medical insurance charge, and stamp duty where the statutory thresholds apply.",
      isMaxRetirement
        ? "Max-retirement mode does not add an extra Armenia retirement top-up because the modeled funded-pension amount is statutory payroll participation rather than a free-form employee deduction."
        : "Mortgage-interest, specialized-tuition, healthcare, and education social-expense refunds are left at zero in compare results because they depend on taxpayer-specific qualifying expenses.",
    ],
    calculation: result,
  };
};
