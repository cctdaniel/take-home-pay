// ============================================================================
// GEORGIA CALCULATOR IMPLEMENTATION
// Tax Year: 2026
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { GE_CONFIG } from "./config";
import {
  calculateGeorgiaStatePensionContribution,
  GE_INCOME_TAX_2026,
  GE_PENSION_2026,
} from "./constants/tax-brackets-2026";
import type { GEBreakdown, GECalculatorInputs, GETaxBreakdown } from "./types";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function isFundedPensionParticipant(inputs: GECalculatorInputs): boolean {
  return (
    inputs.residencyType === "resident" &&
    inputs.pensionParticipation === "mandatory_or_enrolled"
  );
}

export function calculateGE(inputs: GECalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, pensionParticipation } =
    inputs;
  const taxableIncome = Math.max(0, grossSalary);
  const incomeTax = roundCurrency(taxableIncome * GE_INCOME_TAX_2026.rate);
  const isPensionParticipant = isFundedPensionParticipant(inputs);

  const pensionEmployee = isPensionParticipant
    ? roundCurrency(taxableIncome * GE_PENSION_2026.employeeRate)
    : 0;
  const pensionEmployer = isPensionParticipant
    ? roundCurrency(taxableIncome * GE_PENSION_2026.employerRate)
    : 0;
  const statePension = isPensionParticipant
    ? calculateGeorgiaStatePensionContribution(taxableIncome)
    : {
        contributionSalary: 0,
        rate: 0,
        total: 0,
      };

  const taxes: GETaxBreakdown = {
    type: "GE",
    totalIncomeTax: incomeTax,
    incomeTax,
    pensionEmployee,
  };

  const totalTax = incomeTax + pensionEmployee;
  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: GEBreakdown = {
    type: "GE",
    grossIncome: grossSalary,
    taxableIncome,
    residencyType,
    pensionParticipation,
    isPensionParticipant,
    incomeTax: {
      rate: GE_INCOME_TAX_2026.rate,
      taxableIncome,
      total: incomeTax,
    },
    pension: {
      employee: pensionEmployee,
      employer: pensionEmployer,
      state: statePension.total,
      totalAccountContribution: roundCurrency(
        pensionEmployee + pensionEmployer + statePension.total,
      ),
      employeeRate: GE_PENSION_2026.employeeRate,
      employerRate: GE_PENSION_2026.employerRate,
      stateFirstBandLimit: GE_PENSION_2026.stateFirstBandLimit,
      stateSecondBandLimit: GE_PENSION_2026.stateSecondBandLimit,
      stateFirstBandRate: GE_PENSION_2026.stateFirstBandRate,
      stateSecondBandRate: GE_PENSION_2026.stateSecondBandRate,
      stateAboveSecondBandRate: GE_PENSION_2026.stateAboveSecondBandRate,
      stateContributionSalary: statePension.contributionSalary,
      stateRate: statePension.rate,
    },
    assumptions: {
      ordinaryEmploymentSalaryOnly: true,
      excludesSmallBusinessRegimes: true,
      excludesIndividualEntrepreneurRegimes: true,
    },
  };

  return {
    country: "GE",
    currency: "GEL",
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
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const GECalculator: CountryCalculator = {
  countryCode: "GE",
  config: GE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "GE") {
      throw new Error("GECalculator can only calculate GE inputs");
    }
    return calculateGE(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): GECalculatorInputs {
    return {
      country: "GE",
      grossSalary: 36_000,
      payFrequency: "monthly",
      residencyType: "resident",
      pensionParticipation: "mandatory_or_enrolled",
      contributions: {},
    };
  },
};
