import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  PL_IKZE_ANNUAL_CAP_2026,
  PL_PPK_ADDITIONAL_MAX_RATE,
} from "./constants/tax-year-2026";
import type { PLCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as PLCalculatorInputs;
  const ikze = isMaxRetirement ? Math.min(PL_IKZE_ANNUAL_CAP_2026, grossLocal) : 0;
  const ppkAdditional = isMaxRetirement
    ? grossLocal * PL_PPK_ADDITIONAL_MAX_RATE
    : 0;
  const calculatorInputs: PLCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    numberOfChildren: 0,
    contributions: { ikze, ppkAdditional },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "No child tax credit in compare",
  ];
  if (ikze > 0 || ppkAdditional > 0) {
    assumptions.push("IKZE at annual cap and PPK additional at 4% of gross");
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
