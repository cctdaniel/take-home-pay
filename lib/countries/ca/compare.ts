import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { CANADA_RRSP_2026 } from "./constants/tax-year-2026";
import type { CACalculatorInputs } from "./types";

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  isMaxRetirement,
}) => {
  const defaultInputs = getDefaultInputs(country) as CACalculatorInputs;
  const rrspContribution = isMaxRetirement
    ? Math.min(
        grossLocal * CANADA_RRSP_2026.contributionRateLimit,
        CANADA_RRSP_2026.annualDollarLimit,
      )
    : 0;
  const caInputs: CACalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    province: defaultInputs.province,
    contributions: {
      ...defaultInputs.contributions,
      rrspContribution,
    },
  };
  const result = calculateNetSalary(caInputs);
  const provinceName = result.breakdown.type === "CA" ? result.breakdown.provinceName : "selected province";
  const assumptions = [
    `${provinceName} resident employee for Canada compare`,
    "Federal + selected provincial/territorial brackets and statutory payroll contributions modeled",
  ];

  if (rrspContribution > 0) {
    assumptions.push("RRSP contribution set to modeled max");
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
