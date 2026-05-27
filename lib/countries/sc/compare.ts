import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { SCCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as SCCalculatorInputs;
  const calculatorInputs: SCCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employeeTaxTable: "non_citizen",
    citizenship: "non_citizen",
    taxableNonMonetaryBenefits: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: 0,
      qualifyingExpenses: 0,
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
      "Seychelles compare uses the non-citizen employee income-tax table, matching the relocation-oriented default on the country page.",
      "Specific-project 3% and stevedore 10% tables are available on the Seychelles page but are not assumed in compare without job-category facts.",
      "The mandatory Seychelles Pension Fund employee contribution is calculated automatically.",
      "Taxable non-monetary benefits are set to zero in compare; the country page can show the separate employer-only non-monetary benefits tax estimate when a benefit value is known.",
      isMaxRetirement
        ? "Max-retirement mode does not add SPF voluntary savings because they are cash retirement savings, not salary income-tax relief."
        : "SPF voluntary savings are available on the Seychelles page and left at zero in compare because the amount is a personal cash-saving choice, not salary income-tax relief.",
    ],
    calculation: result,
  };
};
