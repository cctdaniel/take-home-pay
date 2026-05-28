import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { IL_SUPPLEMENTAL_PENSION_MAX_RATE } from "./constants/tax-year-2026";
import type { ILCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as ILCalculatorInputs;
  const childrenUnder6 = Math.min(inputs.numberOfChildren, 6);
  const children6To17 = Math.max(0, inputs.numberOfChildren - childrenUnder6);
  const supplementalPension = isMaxRetirement
    ? grossLocal * IL_SUPPLEMENTAL_PENSION_MAX_RATE
    : 0;
  const calculatorInputs: ILCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    isMarried: inputs.maritalStatus === "married",
    childrenUnder6,
    children6To17,
    contributions: {
      studyFund: 0,
      supplementalPension,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const assumptions = [
    ...buildAssumptionsSummary(country, inputs, isMaxRetirement),
    "Israel credit points mapped from compare children profile",
  ];
  if (supplementalPension > 0) {
    assumptions.push("Supplemental pension at 5% of gross cap");
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
