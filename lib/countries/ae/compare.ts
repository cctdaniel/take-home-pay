import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { AECalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as AECalculatorInputs;
  const employeeCategory = "foreign_expat";
  const aeInputs: AECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    employeeCategory,
    iloeBasicSalaryMonthly: grossLocal / 12,
    pensionContributionSalaryMonthly: 0,
    unemploymentInsuranceCategory:
      grossLocal / 12 > 16_000 ? "category2" : "category1",
    contributions: {},
  };
  const result = calculateNetSalary(aeInputs);
  const assumptions = [
    "Foreign / expat employee; UAE nationality pension is not assumed",
    "No personal income tax on wages",
    grossLocal / 12 > 16_000
      ? "ILOE unemployment insurance category 2 premium included from the monthly basic salary proxy"
      : "ILOE unemployment insurance category 1 premium included from the monthly basic salary proxy",
    "UAE/GCC national pension contribution salary is selectable on the UAE page but not inferred for expatriate compare results.",
  ];

  if (isMaxRetirement) {
    assumptions.push(
      "Max-retirement mode does not add a UAE amount because salary has 0% personal income tax and expat retirement savings are not an employee tax deduction in this model",
    );
  }

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
    assumptions,
    calculation: result,
  };
};
