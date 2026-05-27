import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary } from "@/lib/countries/registry";
import type { RSCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  buildAssumptionsSummary,
}) => {
  const calculatorInputs: RSCalculatorInputs = {
    country: "RS",
    grossSalary: grossLocal,
    taxableNonCashBenefits: 0,
    taxableFringeBenefits: 0,
    payFrequency,
    includeAnnualPersonalIncomeTax: true,
    newlySettledRelief: "none",
    age: inputs.assumptions.age,
    numberOfDependents: Math.min(Math.max(inputs.numberOfChildren, 0), 10),
    contributions: {
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
      "Ordinary Serbia employee payroll model",
      "No taxable fringe benefits entered in compare",
      "Newly settled taxpayer relief is not assumed in compare because it requires individual employer, residency, documentation, salary-threshold, and five-year eligibility checks.",
      "Supplementary annual personal income tax is included as a salary-only estimate when thresholds apply; no alternative-investment-fund credit is assumed in compare.",
      "No extra Serbia retirement amount is added in compare because the salary model has no general employee retirement deduction.",
    ],
    calculation: result,
  };
};
