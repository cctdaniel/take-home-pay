import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { roundCurrency } from "../calculator-utils";
import {
  PA_VOLUNTARY_PENSION_ANNUAL_CAP,
  PA_VOLUNTARY_PENSION_MAX_GROSS_RATE,
} from "./constants/tax-year-2026";
import type { PACalculatorInputs } from "./types";

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
  const voluntaryPension = isMaxRetirement
    ? Math.min(
        PA_VOLUNTARY_PENSION_ANNUAL_CAP,
        roundCurrency(grossLocal * PA_VOLUNTARY_PENSION_MAX_GROSS_RATE),
      )
    : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as PACalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { voluntaryPension },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  assumptions.push(
    "Panama-sourced employment salary with CSS and educational insurance",
    "Foreign remote income territorial exemption not modeled",
  );
  if (voluntaryPension > 0) {
    assumptions.push(
      "Voluntary pension (Law 10/1993) at min(10% gross, USD 15,000) cap",
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
