import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { GTCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as GTCalculatorInputs;
  const calculatorInputs: GTCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      insurancePremiums: 0,
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
      "Guatemala compare uses ordinary employment ISR with the standard annual personal deduction and IGSS employee contribution.",
      "VAT invoice credit, verified donations, and death-risk-only life insurance premiums are set to zero in compare because the compare questionnaire does not collect annual claim amounts.",
      isMaxRetirement
        ? "No Guatemala employee-controlled salary retirement deduction is modeled for the max-retirement compare setting."
        : "No optional Guatemala annual deduction is included in compare results.",
    ],
    calculation: result,
  };
};
