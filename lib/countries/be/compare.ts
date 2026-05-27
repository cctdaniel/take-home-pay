import {
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import type { BECalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as BECalculatorInputs;
  const calculatorInputs: BECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    taxableBenefitsInKind: 0,
    numberOfDependentChildren: Math.min(inputs.numberOfChildren, 10),
    numberOfChildrenUnderThreeNoChildcare: 0,
    childcareDays: 0,
    isSingleParentWithChildren: false,
    expatRegimeType: "none",
    expatRecurringAllowance: 0,
  };
  const pensionLimit =
    getCountryCalculator(country).getContributionLimits(calculatorInputs)
      .pensionSavings.limit;
  const retirementApplied =
    inputs.assumptions.retirementContributions === "max";
  calculatorInputs.contributions = {
    pensionSavings: retirementApplied ? pensionLimit : 0,
    childcareExpenses: 0,
    charitableDonations: 0,
  };
  const result = calculateNetSalary(calculatorInputs);
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
    assumptions: [
      ...buildAssumptionsSummary(country, inputs, retirementApplied),
      "Ordinary resident employee model for Belgium",
      retirementApplied
        ? "Max modeled Belgian pension savings"
        : "No modeled pension savings contribution",
      inputs.numberOfChildren > 0
        ? "Dependent-child tax-free allowance mapped from compare children"
        : "No dependent-child allowance",
      "No taxable benefits in kind entered in compare",
      "Young-child and single-parent allowance increases left at zero in compare",
      "No childcare expenses or qualifying gifts entered in compare",
      "Special inpatriate regime left off in compare because it depends on employer application approval and a separate paid allowance",
    ],
    calculation: result,
  };
};
