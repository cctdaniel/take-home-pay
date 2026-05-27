import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { FICalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as FICalculatorInputs;
  const limits = getCountryCalculator(country).getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
  });
  const voluntaryPensionInsurance = isMaxRetirement
    ? Math.min(limits.voluntaryPensionInsurance.limit, grossLocal)
    : 0;
  const calculatorInputs: FICalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxRegime: "ordinary",
    age: inputs.assumptions.age,
    taxableFringeBenefits: 0,
    contributions: {
      ...defaultInputs.contributions,
      commutingExpenses: 0,
      unemploymentFundFees: 0,
      otherIncomeProductionExpenses: 0,
      householdWorkExpenses: 0,
      voluntaryPensionInsurance,
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
      ...buildAssumptionsSummary(
        country,
        inputs,
        voluntaryPensionInsurance > 0,
      ),
      "Finland comparison uses ordinary resident employee rules with the national scale, average municipal-rate proxy, and no commuting or household-work spend.",
      "Taxable fringe benefits, unemployment fund fees, and other income-production expenses are set to zero in compare.",
      voluntaryPensionInsurance > 0
        ? "Max modeled Finnish voluntary pension / PS savings contribution applied as a deficit-credit proxy"
        : "No Finnish voluntary pension / PS savings contribution",
      "The foreign key employee tax-at-source regime is available on the country page but is not assumed in compare results.",
    ],
    calculation: result,
  };
};
