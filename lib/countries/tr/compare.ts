import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { TR_BES_MAX_GROSS_RATE } from "./constants/tax-year-2026";
import type { TRCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as TRCalculatorInputs;
  const privatePension = isMaxRetirement
    ? grossLocal * TR_BES_MAX_GROSS_RATE
    : 0;
  const result = calculateNetSalary({
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: { privatePension },
  });
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Minimum wage income tax exemption modeled",
    "SGK/unemployment on capped insurable base",
  ];
  if (privatePension > 0) {
    assumptions.push("BES private pension at 3% of gross with 30% tax credit");
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
