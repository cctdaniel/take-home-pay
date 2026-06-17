import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { BG_VOLUNTARY_PENSION_MAX_TAX_BASE_RATE, BG_SOCIAL_ANNUAL_CAP, BG_SOCIAL_EMPLOYEE_RATE } from "./constants/tax-year-2026";
import type { BGCalculatorInputs } from "./types";
import { roundCurrency } from "../calculator-utils";

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
  const socialBase = Math.min(grossLocal, BG_SOCIAL_ANNUAL_CAP);
  const socialSecurity = roundCurrency(socialBase * BG_SOCIAL_EMPLOYEE_RATE);
  const voluntaryPension = isMaxRetirement
    ? roundCurrency(
        Math.max(0, grossLocal - socialSecurity) * BG_VOLUNTARY_PENSION_MAX_TAX_BASE_RATE,
      )
    : 0;
  const calculatorInputs: BGCalculatorInputs = {
    ...(getDefaultInputs(country) as BGCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { voluntaryPension },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Flat 10% PIT after employee social security",
  ];
  if (voluntaryPension > 0) {
    assumptions.push("Voluntary supplementary pension at 10% of tax base cap");
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
