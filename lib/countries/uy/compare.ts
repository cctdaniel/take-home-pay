import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { UYCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as UYCalculatorInputs;
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
  const calculatorInputs: UYCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfChildren: Math.min(inputs.numberOfChildren, 10),
    numberOfDisabledChildren: 0,
    housingCreditType: "none",
    aguinaldoMode: "includedInGross",
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      housingExpenses: 0,
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
      "Uruguay compare treats gross as an annual cash package that already includes the legal sueldo anual complementario.",
      inputs.numberOfChildren > 0
        ? "Child IRPF deduction bases mapped from compare children; disabled-child deduction is not assumed."
        : "No child IRPF deduction base assumed.",
      retirementApplied
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured cap`
        : "Voluntary AFAP savings left at 0 unless max-retirement is selected",
      "Rent and mortgage credits are left at 0 in compare because they require local housing facts.",
    ],
    calculation: result,
  };
};
