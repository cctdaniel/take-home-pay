import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { MEXICO_VOLUNTARY_RETIREMENT_2026 } from "./constants/tax-year-2026";
import type { MXCalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as MXCalculatorInputs;
  const voluntaryRetirementContribution = isMaxRetirement
    ? Math.min(
        grossLocal * MEXICO_VOLUNTARY_RETIREMENT_2026.deductionRateLimit,
        MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
      )
    : 0;
  const mxInputs: MXCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    contributions: {
      voluntaryRetirementContribution,
    },
  };
  const result = calculateNetSalary(mxInputs);
  const assumptions = [
    "Resident salary employee for Mexico compare",
    "Annual ISR tariff plus estimated employee IMSS placeholder modeled",
  ];

  if (voluntaryRetirementContribution > 0) {
    assumptions.push("Voluntary retirement contribution set to modeled max");
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
