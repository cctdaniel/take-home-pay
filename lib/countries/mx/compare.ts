import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import {
  MEXICO_SALARY_EXEMPTIONS_2026,
  MEXICO_VOLUNTARY_RETIREMENT_2026,
} from "./constants/tax-year-2026";
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
  const statutoryAguinaldoIncludedInGross =
    (grossLocal * MEXICO_SALARY_EXEMPTIONS_2026.statutoryAguinaldoDays) /
    (365 + MEXICO_SALARY_EXEMPTIONS_2026.statutoryAguinaldoDays);
  const mxInputs: MXCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    state: defaultInputs.state,
    aguinaldoTreatment: "includedInGross",
    aguinaldoIncludedInGross: statutoryAguinaldoIncludedInGross,
    vacationPremium: 0,
    ptuProfitSharing: 0,
    contributions: {
      ...defaultInputs.contributions,
      voluntaryRetirementContribution,
    },
  };
  const result = calculateNetSalary(mxInputs);
  const stateName = result.breakdown.type === "MX" ? result.breakdown.stateName : "selected state";
  const assumptions = [
    `${stateName} resident salary employee for Mexico compare`,
    "Federal ISR plus national employee IMSS modeled",
    "State payroll taxes are employer-side and do not reduce modeled employee take-home pay",
    "Annual gross is treated as a cash package including the statutory 15-day aguinaldo exemption",
    "No separate vacation premium or PTU amount entered in compare",
  ];

  if (voluntaryRetirementContribution > 0) {
    assumptions.push("Retirement: max");
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
