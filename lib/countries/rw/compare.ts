import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { RWCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as RWCalculatorInputs;
  const calculatorInputs: RWCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    pensionCoverage: "employee",
    rssbMedicalSchemeCovered:
      inputs.assumptions.hasPrivateHealthInsurance,
    rssbContributionSalaryMonthly: 0,
    rssbMedicalBasicSalaryMonthly: 0,
    hasHousingBenefit: false,
    hasMotorVehicleBenefit: false,
    otherTaxableBenefitsInKind: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      housingExpenses: 0,
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
      "Compare assumes ordinary employee RSSB pension coverage at 6%.",
      inputs.assumptions.hasPrivateHealthInsurance
        ? "Private-health assumption maps to RSSB medical scheme employee contribution at 7.5%."
        : "No RSSB medical scheme coverage is included in compare results.",
      "No taxable benefits in kind are entered in compare results.",
      isMaxRetirement
        ? "Max-retirement mode does not add an EjoHeza-style amount because the reviewed PAYE/RSSB salary sources do not make it a general employee payroll deduction; voluntary-member pension is a separate RSSB coverage choice."
        : "No additional Rwanda salary deduction is included in compare results.",
    ],
    calculation: result,
  };
};
