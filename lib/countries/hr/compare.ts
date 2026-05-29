import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type {
  CountryComparison,
  CountryComparisonAdapterContext,
} from "@/hooks/use-country-comparison";
import type { HRCalculatorInputs } from "./types";

export function buildCountryComparison({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison | null {
  const defaultInputs = getDefaultInputs(country) as HRCalculatorInputs;
  const hrInputs: HRCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyType: inputs.assumptions.isResident
      ? "resident"
      : "non_resident",
    locality: "zagreb",
    hasDependentSpouse:
      inputs.maritalStatus === "married" &&
      inputs.assumptions.spouseHasNoIncome,
    numberOfChildren: inputs.numberOfChildren,
    contributions: {},
  };
  const result = calculateNetSalary(hrInputs);
  const assumptions = buildAssumptionsSummary(country, inputs, false);

  assumptions.push(
    inputs.assumptions.isResident ? "Resident" : "Non-resident",
  );
  assumptions.push("Zagreb rates");

  if (isMaxRetirement) {
    assumptions.push(
      "Croatian payroll income tax does not allow employee voluntary third-pillar deductions on salary",
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
}
