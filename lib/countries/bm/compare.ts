import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { BMCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as BMCalculatorInputs;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits({
      ...defaultInputs,
      grossSalary: grossLocal,
    });
  const calculatorInputs: BMCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    taxableNonCashBenefits: 0,
    payFrequency,
    payrollTaxDeducted: true,
    socialInsuranceCovered: true,
    occupationalPensionTreatment: "employeeDeducted",
    nonWorkingSpouseHealthCoverage: false,
    contributions: {
      ...defaultInputs.contributions,
      insurancePremiums:
        contributionLimits.insurancePremiums?.limit ??
        defaultInputs.contributions.insurancePremiums,
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
      "Employee payroll tax is assumed to be deducted from pay.",
      "Full-year employee social insurance is included.",
      "Eligible occupational pension coverage is assumed with the 5% employee share deducted from pay.",
      "Employee health insurance deduction uses half of the 2026 standard premium rate for employee-only coverage.",
      ...(isMaxRetirement
        ? [
            "Max-retirement mode does not add an extra Bermuda retirement amount because the modeled eligible occupational pension employee share is already deducted from pay.",
          ]
        : []),
      "No taxable cash or in-kind benefits are entered in compare; the Bermuda page can model them separately from cash salary.",
    ],
    calculation: result,
  };
};
