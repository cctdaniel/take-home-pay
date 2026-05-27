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
  calculateGeorgiaSmallBusinessTax,
  calculateGeorgiaStatePensionContribution,
  GE_INCOME_TAX_2026,
  GE_MICRO_BUSINESS_2026,
  GE_PENSION_2026,
  GE_SMALL_BUSINESS_2026,
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
    inputs.incomeRegime === "employment" &&
    inputs.residencyType === "resident" &&
    inputs.pensionParticipation === "mandatory_or_enrolled"
  );
}

export function calculateGE(inputs: GECalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    incomeRegime = "employment",
    residencyType,
    pensionParticipation,
  } = inputs;
  const taxableIncome = Math.max(0, grossSalary);
  const smallBusinessThresholdTreatment =
    inputs.smallBusinessThresholdTreatment ?? "even_monthly";
  const smallBusinessTax = calculateGeorgiaSmallBusinessTax(
    taxableIncome,
    smallBusinessThresholdTreatment,
  );
  const microBusinessLimitExceeded =
    incomeRegime === "micro_business" &&
    taxableIncome > GE_MICRO_BUSINESS_2026.incomeLimit;
  const incomeTax = roundCurrency(
    incomeRegime === "small_business"
      ? smallBusinessTax.tax
      : incomeRegime === "micro_business"
        ? microBusinessLimitExceeded
          ? taxableIncome * GE_INCOME_TAX_2026.rate
          : taxableIncome * GE_MICRO_BUSINESS_2026.rate
        : taxableIncome * GE_INCOME_TAX_2026.rate,
  );
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
        firstBandContributionSalary: 0,
        secondBandContributionSalary: 0,
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
    incomeRegime,
    residencyType,
    pensionParticipation,
    isPensionParticipant,
    incomeTax: {
      rate:
        incomeRegime === "small_business"
          ? smallBusinessTax.effectiveRate
          : incomeRegime === "micro_business" && !microBusinessLimitExceeded
            ? GE_MICRO_BUSINESS_2026.rate
            : GE_INCOME_TAX_2026.rate,
      taxableIncome,
      total: incomeTax,
    },
    businessRegime: {
      microBusinessIncomeLimit: GE_MICRO_BUSINESS_2026.incomeLimit,
      microBusinessLimitExceeded,
      smallBusinessIncomeLimit: GE_SMALL_BUSINESS_2026.incomeLimit,
      smallBusinessThresholdTreatment,
      standardRateIncome:
        incomeRegime === "small_business"
          ? smallBusinessTax.standardRateIncome
          : 0,
      overLimitRateIncome:
        incomeRegime === "small_business"
          ? smallBusinessTax.overLimitRateIncome
          : 0,
      standardRate: GE_SMALL_BUSINESS_2026.standardRate,
      overLimitRate: GE_SMALL_BUSINESS_2026.overLimitRate,
      effectiveRate:
        incomeRegime === "small_business" ? smallBusinessTax.effectiveRate : 0,
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
      stateFirstBandContributionSalary:
        statePension.firstBandContributionSalary,
      stateSecondBandContributionSalary:
        statePension.secondBandContributionSalary,
    },
    assumptions: {
      ordinaryEmploymentSalaryOnly: incomeRegime === "employment",
      includesIndividualEntrepreneurRegimes: incomeRegime !== "employment",
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
      incomeRegime: "employment",
      residencyType: "resident",
      pensionParticipation: "mandatory_or_enrolled",
      smallBusinessThresholdTreatment: "even_monthly",
      contributions: {},
    };
  },
};
