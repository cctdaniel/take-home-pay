import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { SECalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as SECalculatorInputs;
  const limits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
  });
  const privatePensionSavings = isMaxRetirement
    ? Math.min(limits.privatePensionSavings.limit, grossLocal)
    : 0;
  const calculatorInputs: SECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxRegime: "ordinary",
    noOccupationalPension: privatePensionSavings > 0,
    contributions: {
      ...defaultInputs.contributions,
      privatePensionSavings,
      commutingExpenses: 0,
      otherWorkExpenses: 0,
      rotRutTaxReduction: 0,
      greenTechnologyTaxReduction: 0,
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
      ...buildAssumptionsSummary(country, inputs, privatePensionSavings > 0),
      "Sweden comparison uses ordinary resident employee rules with the modeled average municipal tax rate.",
      privatePensionSavings > 0
        ? "Max modeled Swedish private pension deduction applied on the assumption that the employee completely lacks occupational pension rights at work."
        : "No Swedish private pension deduction, commuting deduction, work-expense deduction, ROT/RUT reduction, or green-technology reduction is assumed in compare results.",
      "Expert tax relief is available on the country page but is not assumed in compare results.",
    ],
    calculation: result,
  };
};
