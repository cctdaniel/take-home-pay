import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { MX_CONFIG } from "./config";
import {
  MEXICO_IMSS_EMPLOYEE_RATE_ESTIMATE,
  MEXICO_IMSS_EMPLOYEE_RATE_NOTE,
  MEXICO_ISR_BRACKETS_2026,
  MEXICO_SOURCE_URLS,
  MEXICO_VOLUNTARY_RETIREMENT_2026,
} from "./constants/tax-year-2026";
import type { MXBreakdown, MXCalculatorInputs, MXTaxBreakdown } from "./types";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual": return 1;
    case "monthly": return 12;
    case "biweekly": return 26;
    case "weekly": return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateMX(inputs: MXCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const voluntaryRetirementContributionLimit = Math.min(
    grossSalary * MEXICO_VOLUNTARY_RETIREMENT_2026.deductionRateLimit,
    MEXICO_VOLUNTARY_RETIREMENT_2026.modeledAnnualCap,
  );
  const voluntaryRetirementContribution = Math.min(
    Math.max(0, inputs.contributions?.voluntaryRetirementContribution ?? 0),
    voluntaryRetirementContributionLimit,
  );
  const taxableIncome = Math.max(0, grossSalary - voluntaryRetirementContribution);
  const bracket =
    MEXICO_ISR_BRACKETS_2026.find(
      (candidate) => taxableIncome > candidate.min && taxableIncome <= candidate.max,
    ) ?? MEXICO_ISR_BRACKETS_2026[0];
  const marginalTax = roundCurrency((taxableIncome - bracket.min) * bracket.rate);
  const incomeTax = roundCurrency(bracket.fixedFee + marginalTax);
  const socialSecurity = roundCurrency(grossSalary * MEXICO_IMSS_EMPLOYEE_RATE_ESTIMATE);

  const taxes: MXTaxBreakdown = {
    type: "MX",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const voluntaryContributions = voluntaryRetirementContribution;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: MXBreakdown = {
    type: "MX",
    grossIncome: grossSalary,
    taxableIncome,
    isrBracket: bracket,
    fixedFee: bracket.fixedFee,
    marginalTax,
    socialSecurityRate: MEXICO_IMSS_EMPLOYEE_RATE_ESTIMATE,
    voluntaryContributions: {
      voluntaryRetirementContribution,
      voluntaryRetirementContributionLimit,
      total: voluntaryContributions,
    },
    assumptions: [
      "Uses the 2026 annual ISR tariff for resident salary income.",
      MEXICO_IMSS_EMPLOYEE_RATE_NOTE,
      "Models voluntary retirement savings as a personal deduction capped at 10% of income and a modeled annual cap; plan-specific rules are not modeled.",
      "Does not yet model subsidies, exemptions, deductions beyond voluntary retirement, aguinaldo treatment, state payroll taxes, or detailed IMSS caps by salary base.",
    ],
    sourceUrls: MEXICO_SOURCE_URLS,
  };

  return {
    country: "MX",
    currency: "MXN",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const MXCalculator: CountryCalculator = {
  countryCode: "MX",
  config: MX_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "MX") {
      throw new Error("MXCalculator can only calculate MX inputs");
    }
    return calculateMX(inputs as MXCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): MXCalculatorInputs {
    return {
      country: "MX",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {
        voluntaryRetirementContribution: 0,
      },
    };
  },
};
