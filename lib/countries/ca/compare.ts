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
  inputs,
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
    taxableNonCashBenefits: 0,
    federalFamilyCreditType:
      inputs.maritalStatus === "married" && inputs.assumptions.spouseHasNoIncome
        ? "spouse_or_common_law"
        : inputs.maritalStatus === "single" && inputs.numberOfChildren > 0
          ? "eligible_dependant"
          : "none",
    federalFamilyCreditDependentNetIncome: 0,
    numberOfChildrenUnder7: inputs.assumptions.hasYoungChildren
      ? inputs.numberOfChildren
      : 0,
    numberOfChildrenAge7To16: inputs.assumptions.hasYoungChildren
      ? 0
      : inputs.numberOfChildren,
    numberOfDisabledChildren: 0,
    contributions: {
      ...defaultInputs.contributions,
      rrspContribution,
      charitableDonations: 0,
    },
  };
  const result = calculateNetSalary(caInputs);
  const provinceName = result.breakdown.type === "CA" ? result.breakdown.provinceName : "selected province";
  const assumptions = [
    `${provinceName} resident employee for Canada compare`,
    "Federal + selected provincial/territorial brackets, basic personal credits, and statutory payroll contributions modeled",
  ];

  if (rrspContribution > 0) {
    assumptions.push("Retirement: max");
    assumptions.push("RRSP contribution set to modeled max; RPP is employer-plan-specific and FHSA is home-savings, not retirement");
  }

  assumptions.push("No childcare, union/professional dues, FHSA, RPP, or charitable donations are assumed unless entered on the Canada country page.");
  assumptions.push("No taxable non-cash benefits are entered in compare; the Canada page can model them separately from cash salary.");

  if (caInputs.federalFamilyCreditType !== "none") {
    assumptions.push("Federal spouse/common-law or eligible-dependant amount applied with zero dependant net income");
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
