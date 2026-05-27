import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { CHCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as CHCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: CHCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      insurancePremiums:
        contributionLimits.insurancePremiums?.limit ??
        defaultInputs.contributions.insurancePremiums,
      carerWages: 0,
      educationExpenses: 0,
      charitableDonations: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs as CalculatorInputs);
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
      "Zurich city, no-church-tax, single resident employee benchmark",
      "Default comparison assumes the taxpayer can use the modeled Zurich insurance-premium deduction cap",
      retirementLimit > 0
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured annual cap`
        : "No Switzerland Pillar 3a amount is added because no contribution room is available for the current assumptions.",
      "Family, childcare, training, and donation fields are left at zero in compare unless entered on the Switzerland page",
    ],
    calculation: result,
  };
};
