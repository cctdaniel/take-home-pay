import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { PYCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as PYCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
      aguinaldoMode: "includedInGross",
    });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: PYCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    ipsCovered: true,
    aguinaldoMode: "includedInGross",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
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
      "Paraguay compare treats gross as an annual cash package that already includes the statutory aguinaldo.",
      "Ordinary private-sector IPS coverage is assumed.",
      retirementApplied
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured annual cap`
        : "No extra Paraguay retirement amount is added for ordinary salaried IPS-covered employees.",
      "Documented deductible expenses are left at 0 in compare because they require DNIT-supported vouchers.",
    ],
    calculation: result,
  };
};
