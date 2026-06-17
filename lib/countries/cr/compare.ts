import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { CRCalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as CRCalculatorInputs;
  const crInputs: CRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    dependentChildren: 0,
    spouseCredit: 0,
    contributions: {},
  };
  const result = calculateNetSalary(crInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);
  assumptions.push(
    "Resident salaried employee",
    "No child or spouse tax credits in compare baseline",
    "CCSS 10.83% and monthly salary tariff per Decree 45333-H",
  );

  if (isMaxRetirement) {
    assumptions.push("No voluntary tax-reducing retirement modeled");
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
