import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { getLithuanianPensionDeductionLimit } from "./calculator";
import { LT_VSD_ANNUAL_CAP, LT_VSD_EMPLOYEE_RATE } from "./constants/tax-year-2026";
import type { LTCalculatorInputs } from "./types";

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
  const vsdBase = Math.min(grossLocal, LT_VSD_ANNUAL_CAP);
  const grossAfterVsd = Math.max(0, grossLocal - vsdBase * LT_VSD_EMPLOYEE_RATE);
  const pensionDeduction = isMaxRetirement
    ? getLithuanianPensionDeductionLimit(grossAfterVsd)
    : 0;
  const calculatorInputs: LTCalculatorInputs = {
    ...(getDefaultInputs(country) as LTCalculatorInputs),
    grossSalary: grossLocal,
    payFrequency,
    contributions: { pensionDeduction },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, isMaxRetirement);
  if (pensionDeduction > 0) {
    assumptions.push("Pension/life insurance deduction at modeled cap");
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
