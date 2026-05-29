import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  SI_PENSION_EMPLOYEE_RATE,
  SI_SUPPLEMENTARY_PENSION_ANNUAL_CAP_2026,
  SI_SUPPLEMENTARY_PENSION_RATE_OF_GROSS,
  SI_SUPPLEMENTARY_PENSION_RATE_OF_PENSION,
} from "./constants/tax-year-2026";
import type { SICalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = (ctx) => {
  const { country, config, currency, rate, grossLocal, payFrequency, inputs, isMaxRetirement, buildAssumptionsSummary } = ctx;
  const pensionContributions = grossLocal * SI_PENSION_EMPLOYEE_RATE;
  const supplementaryLimit = Math.min(
    SI_SUPPLEMENTARY_PENSION_ANNUAL_CAP_2026,
    grossLocal * SI_SUPPLEMENTARY_PENSION_RATE_OF_GROSS,
    pensionContributions * SI_SUPPLEMENTARY_PENSION_RATE_OF_PENSION,
  );
  const supplementaryPension = isMaxRetirement ? supplementaryLimit : 0;
  const result = calculateNetSalary({
    ...(getDefaultInputs(country) as SICalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { supplementaryPension },
  });
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (supplementaryPension > 0) assumptions.push("Supplementary pension at modeled cap");
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
