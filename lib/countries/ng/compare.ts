import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { NG_AVC_MAX_ADDITIONAL_RATE } from "./constants/tax-year-2026";
import type { NGCalculatorInputs } from "./types";
import { roundCurrency } from "../calculator-utils";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const {
    country,
    config,
    currency,
    rate,
    grossLocal,
    payFrequency,
    inputs,
    isMaxRetirement,
    buildAssumptionsSummary,
  } = ctx;
  const additionalVoluntaryPension = isMaxRetirement
    ? roundCurrency(grossLocal * NG_AVC_MAX_ADDITIONAL_RATE)
    : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as NGCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { additionalVoluntaryPension },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  assumptions.push("Mandatory pension 8% before NTA 2025 PAYE");
  if (additionalVoluntaryPension > 0) {
    assumptions.push("Additional voluntary pension (AVC) at 10% of gross cap");
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
