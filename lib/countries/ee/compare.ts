import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import {
  EE_THIRD_PILLAR_ABSOLUTE_LIMIT,
  EE_THIRD_PILLAR_RATE_LIMIT,
} from "./constants/tax-year-2026";
import type { EECalculatorInputs } from "./types";

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
  const defaultInputs = getDefaultInputs(country) as EECalculatorInputs;
  const retirementContribution = isMaxRetirement
    ? Math.min(
        EE_THIRD_PILLAR_ABSOLUTE_LIMIT,
        grossLocal * EE_THIRD_PILLAR_RATE_LIMIT,
        grossLocal,
      )
    : 0;
  const calculatorInputs: EECalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    secondPillarRate: "2",
    isPensionableAge: false,
    pensionBasicExemptionUsedElsewhere: 0,
    contributions: {
      ...defaultInputs.contributions,
      retirementContribution,
    },
  };
  const result = calculateNetSalary(calculatorInputs);
  const retirementApplied = retirementContribution > 0;

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
      "Ordinary resident employee model for Estonia",
      "Second-pillar employee rate set to the 2% default in compare",
      retirementApplied
        ? "Third-pillar pension contribution modeled to the annual cap"
        : "Third-pillar pension contribution not applied",
    ],
    calculation: result,
  };
};
