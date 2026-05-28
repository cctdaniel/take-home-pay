import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  EE_THIRD_PILLAR_ANNUAL_CAP_2026,
  EE_THIRD_PILLAR_MAX_GROSS_RATE,
} from "./constants/tax-year-2026";
import type { EECalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as EECalculatorInputs;
  const thirdPillar = isMaxRetirement
    ? Math.min(
        grossLocal * EE_THIRD_PILLAR_MAX_GROSS_RATE,
        EE_THIRD_PILLAR_ANNUAL_CAP_2026,
      )
    : 0;
  const calculatorInputs: EECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: { thirdPillar },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Estonian resident employment with phased basic allowance",
  ];
  if (thirdPillar > 0) {
    assumptions.push("Third pillar at min(15% gross, EUR 6,000) cap");
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
