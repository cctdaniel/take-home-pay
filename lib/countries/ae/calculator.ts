import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { AE_CONFIG } from "./config";
import {
  UAE_EMPLOYEE_CATEGORY_SETTINGS,
  UAE_MODELED_EXCLUSIONS,
  UAE_PERSONAL_INCOME_TAX_RATE,
  UAE_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type {
  AEBreakdown,
  AECalculatorInputs,
  AEEmployeeCategory,
  AETaxBreakdown,
} from "./types";

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

function clamp(value: number, min?: number, max?: number): number {
  const minClamped = min === undefined ? value : Math.max(value, min);
  return max === undefined ? minClamped : Math.min(minClamped, max);
}

function calculateContributionSalary(
  grossSalary: number,
  employeeCategory: AEEmployeeCategory,
) {
  const settings = UAE_EMPLOYEE_CATEGORY_SETTINGS[employeeCategory];
  const monthlySalary = grossSalary / 12;

  if (settings.employeeRate === 0 && settings.employerRate === 0) {
    return {
      monthly: 0,
      annual: 0,
    };
  }

  const monthly = clamp(
    monthlySalary,
    grossSalary > 0 ? settings.monthlyMinimum : undefined,
    settings.monthlyMaximum,
  );

  return {
    monthly,
    annual: monthly * 12,
  };
}

function getAssumptions(employeeCategory: AEEmployeeCategory): string[] {
  const settings = UAE_EMPLOYEE_CATEGORY_SETTINGS[employeeCategory];

  return [
    "UAE personal income tax on salary is modeled as 0%.",
    settings.salaryBaseDescription,
    ...settings.notes,
  ];
}

export function calculateAE(inputs: AECalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, employeeCategory } = inputs;
  const settings = UAE_EMPLOYEE_CATEGORY_SETTINGS[employeeCategory];
  const contributionSalary = calculateContributionSalary(
    grossSalary,
    employeeCategory,
  );
  const incomeTax = 0;
  const pensionEmployee = roundCurrency(
    contributionSalary.annual * settings.employeeRate,
  );
  const pensionEmployer = roundCurrency(
    contributionSalary.annual * settings.employerRate,
  );
  const receivesGovernmentSupport =
    settings.governmentSupportMonthlyThreshold !== undefined &&
    contributionSalary.monthly > 0 &&
    contributionSalary.monthly < settings.governmentSupportMonthlyThreshold;
  const governmentSupport = receivesGovernmentSupport
    ? roundCurrency(contributionSalary.annual * settings.governmentSupportRate)
    : 0;

  const taxes: AETaxBreakdown = {
    type: "AE",
    totalIncomeTax: incomeTax,
    incomeTax,
    pensionEmployee,
  };
  const totalTax = incomeTax + pensionEmployee;
  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: AEBreakdown = {
    type: "AE",
    grossIncome: grossSalary,
    employeeCategory,
    employeeCategoryLabel: settings.label,
    taxableIncome: 0,
    incomeTaxRate: UAE_PERSONAL_INCOME_TAX_RATE,
    pension: {
      employee: pensionEmployee,
      employer: pensionEmployer,
      governmentSupport,
      employeeRate: settings.employeeRate,
      employerRate: settings.employerRate,
      governmentSupportRate: settings.governmentSupportRate,
      contributionSalaryAnnual: contributionSalary.annual,
      contributionSalaryMonthly: contributionSalary.monthly,
      monthlyMinimum: settings.monthlyMinimum,
      monthlyMaximum: settings.monthlyMaximum,
      governmentSupportMonthlyThreshold:
        settings.governmentSupportMonthlyThreshold,
      salaryBaseDescription: settings.salaryBaseDescription,
    },
    assumptions: getAssumptions(employeeCategory),
    exclusions: UAE_MODELED_EXCLUSIONS,
    sourceUrls: [
      UAE_SOURCE_URLS.personalIncomeTax,
      UAE_SOURCE_URLS.naturalPersonWages,
      settings.sourceUrl,
      UAE_SOURCE_URLS.emirateRegistration,
      UAE_SOURCE_URLS.gccRegistration,
    ],
  };

  return {
    country: "AE",
    currency: "AED",
    grossSalary,
    taxableIncome: 0,
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

export const AECalculator: CountryCalculator = {
  countryCode: "AE",
  config: AE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "AE") {
      throw new Error("AECalculator can only calculate AE inputs");
    }

    return calculateAE(inputs as AECalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): AECalculatorInputs {
    return {
      country: "AE",
      grossSalary: 360_000,
      payFrequency: "monthly",
      employeeCategory: "foreign_expat",
      contributions: {},
    };
  },
};
