import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { ZA_RETIREMENT_ANNUITY_2026 } from "./constants/tax-year-2026";
import type { ZACalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ZACalculatorInputs;
  const retirementAnnuity = isMaxRetirement
    ? Math.min(
        grossLocal * ZA_RETIREMENT_ANNUITY_2026.contributionRateLimit,
        ZA_RETIREMENT_ANNUITY_2026.annualDollarLimit,
      )
    : 0;
  const calculatorInputs: ZACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    medicalDependents: Math.min(inputs.numberOfChildren, 6),
    contributions: {
      retirementAnnuity,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Primary medical aid member with dependents mapped from compare children",
  ];
  if (retirementAnnuity > 0) {
    assumptions.push("Retirement annuity at modeled max");
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
