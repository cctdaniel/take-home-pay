import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { EGCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as EGCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });
  const premiumLimit =
    contributionLimits.retirementContribution?.limit ?? 0;
  const registeredPremiums =
    isMaxRetirement && premiumLimit > 0
      ? Math.min(premiumLimit, grossLocal)
      : 0;
  const calculatorInputs: EGCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableNonCashBenefits: 0,
    socialInsuranceCovered: true,
    socialInsuranceSalaryMonthly: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution: registeredPremiums,
      qualifyingExpenses: 0,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const premiumApplied = registeredPremiums > 0;

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
      ...buildAssumptionsSummary(country, inputs, premiumApplied),
      "Egypt compare uses ordinary employment salary with the employee personal exemption, progressive salary-tax bands, and covered NOSI employee social insurance on the 2026 monthly contribution salary floor/ceiling.",
      "Taxable employment benefits are set to zero in compare results; use the Egypt page when taxable allowances, dependant reimbursements, tuition, long-term living expenses, hardship allowances, or equity compensation values are known.",
      premiumApplied
        ? `${contributionLimits.retirementContribution?.name ?? "Registered private pension or insurance premiums"} modeled up to the configured annual deduction cap.`
        : "Registered private pension, life, or health insurance premium deduction is set to zero in compare results.",
      inputs.assumptions.hasPrivateHealthInsurance
        ? "Private-health coverage is not converted into an Egypt premium amount; use the Egypt page when the annual registered premium is known."
        : "No private health premium amount is entered in compare results.",
    ],
    calculation: result,
  };
};
