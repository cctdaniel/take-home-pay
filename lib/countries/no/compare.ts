import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { NO_IPS_DEDUCTION_LIMIT } from "./constants/tax-year-2026";
import type { NOCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as NOCalculatorInputs;
  const ipsContribution = isMaxRetirement
    ? Math.min(NO_IPS_DEDUCTION_LIMIT, grossLocal)
    : 0;
  const calculatorInputs: NOCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: {
      ipsContribution,
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
      ...buildAssumptionsSummary(country, inputs, ipsContribution > 0),
      "Resident employee, standard salary assumptions",
      ipsContribution > 0
        ? "IPS: max modeled deduction"
        : "IPS not applied",
    ],
    calculation: result,
  };
};
