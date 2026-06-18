import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { AL_VOLUNTARY_PENSION_ANNUAL_CAP } from "./constants/tax-year-2026";
import type { ALCalculatorInputs } from "./types";

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
  const voluntaryPension = isMaxRetirement ? AL_VOLUNTARY_PENSION_ANNUAL_CAP : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as ALCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { voluntaryPension },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  assumptions.push(
    "Social insurance 11.2% capped; personal deduction ALL 360,000; progressive PIT",
  );
  if (voluntaryPension > 0) {
    assumptions.push("Private voluntary pension at ALL 480,000 annual cap");
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
