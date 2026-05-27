import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CalculatorInputs } from "@/lib/countries/types";
import type { DOCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as DOCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
      taxableNonCashBenefits: 0,
      christmasSalaryMode: "includedInGross",
      sdssCovered: true,
      sdssSalaryMonthly: 0,
      fringeBenefitsTaxedToEmployee: false,
    });
  const retirementLimit = contributionLimits.retirementContribution?.limit ?? 0;
  const retirementContribution =
    isMaxRetirement && retirementLimit > 0
      ? Math.min(retirementLimit, grossLocal)
      : 0;
  const calculatorInputs: DOCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    taxableNonCashBenefits: 0,
    payFrequency,
    christmasSalaryMode: "includedInGross",
    sdssCovered: true,
    sdssSalaryMonthly: 0,
    fringeBenefitsTaxedToEmployee: false,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
      qualifyingExpenses: 0,
      educationExpenses: 0,
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
      "Dominican Republic compare treats gross as an annual cash package that already includes the legal salario de Navidad.",
      "Compare assumes standard Dominican SDSS employee withholding with ordinary monthly salary as the AFP/SFS contribution salary and no employee-taxable fringe benefits.",
      "Law 179-09 education expenses are left at 0 in compare because they require local qualifying receipts.",
      retirementApplied
        ? `${contributionLimits.retirementContribution.name} modeled up to the configured annual cap`
        : "No Dominican retirement amount is added in compare because no capped retirement deduction is available for the current assumptions.",
    ],
    calculation: result,
  };
};
