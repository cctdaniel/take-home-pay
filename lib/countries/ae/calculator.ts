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
  getUaeIloeCategoryFromBasicSalary,
  UAE_MODELED_EXCLUSIONS,
  UAE_PERSONAL_INCOME_TAX_RATE,
  UAE_SOURCE_URLS,
  UAE_UNEMPLOYMENT_INSURANCE_CATEGORIES,
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
  enteredContributionSalaryMonthly = 0,
) {
  const settings = UAE_EMPLOYEE_CATEGORY_SETTINGS[employeeCategory];
  const monthlySalary = grossSalary / 12;

  if (settings.employeeRate === 0 && settings.employerRate === 0) {
    return {
      monthly: 0,
      annual: 0,
    };
  }

  if (grossSalary <= 0) {
    return {
      monthly: 0,
      annual: 0,
    };
  }

  const upperMonthlySalary =
    settings.monthlyMaximum === undefined
      ? monthlySalary
      : Math.min(
          Math.max(monthlySalary, settings.monthlyMinimum ?? 0),
          settings.monthlyMaximum,
        );
  const selectedMonthlySalary =
    enteredContributionSalaryMonthly > 0
      ? enteredContributionSalaryMonthly
      : upperMonthlySalary;
  const monthly = clamp(
    selectedMonthlySalary,
    grossSalary > 0 ? settings.monthlyMinimum : undefined,
    upperMonthlySalary,
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
  const { payFrequency, employeeCategory } = inputs;
  const grossSalary = Math.max(0, inputs.grossSalary);
  const settings = UAE_EMPLOYEE_CATEGORY_SETTINGS[employeeCategory];
  const defaultMonthlySalary = grossSalary / 12;
  const iloeBasicSalaryMonthly =
    grossSalary > 0
      ? Math.max(0, inputs.iloeBasicSalaryMonthly || defaultMonthlySalary)
      : 0;
  const selectedUnemploymentInsuranceCategory =
    inputs.unemploymentInsuranceCategory ??
    getUaeIloeCategoryFromBasicSalary(iloeBasicSalaryMonthly);
  const unemploymentInsuranceCategory =
    selectedUnemploymentInsuranceCategory === "notCovered"
      ? selectedUnemploymentInsuranceCategory
      : getUaeIloeCategoryFromBasicSalary(iloeBasicSalaryMonthly);
  const unemploymentInsurance =
    UAE_UNEMPLOYMENT_INSURANCE_CATEGORIES[unemploymentInsuranceCategory] ??
    UAE_UNEMPLOYMENT_INSURANCE_CATEGORIES.category2;
  const unemploymentInsuranceAnnualPremium =
    grossSalary > 0 ? unemploymentInsurance.annualPremium : 0;
  const unemploymentInsuranceMonthlyPremium =
    grossSalary > 0 ? unemploymentInsurance.monthlyPremium : 0;
  const contributionSalary = calculateContributionSalary(
    grossSalary,
    employeeCategory,
    Math.max(0, inputs.pensionContributionSalaryMonthly ?? 0),
  );
  const incomeTax = 0;
  const pensionEmployee = roundCurrency(
    contributionSalary.annual * settings.employeeRate,
  );
  const receivesGovernmentSupport =
    settings.governmentSupportMonthlyThreshold !== undefined &&
    contributionSalary.monthly > 0 &&
    contributionSalary.monthly < settings.governmentSupportMonthlyThreshold;
  const governmentSupportRate = receivesGovernmentSupport
    ? settings.governmentSupportRate
    : 0;
  const employerCashRate = Math.max(
    0,
    settings.employerRate - governmentSupportRate,
  );
  const pensionEmployer = roundCurrency(
    contributionSalary.annual * employerCashRate,
  );
  const governmentSupport = roundCurrency(
    contributionSalary.annual * governmentSupportRate,
  );

  const taxes: AETaxBreakdown = {
    type: "AE",
    totalIncomeTax: incomeTax,
    incomeTax,
    pensionEmployee,
    unemploymentInsurance: unemploymentInsuranceAnnualPremium,
  };
  const totalTax =
    incomeTax + pensionEmployee + unemploymentInsuranceAnnualPremium;
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
    unemploymentInsurance: {
      category: unemploymentInsuranceCategory,
      label: unemploymentInsurance.label,
      basicSalaryMonthly:
        unemploymentInsuranceCategory === "notCovered"
          ? 0
          : iloeBasicSalaryMonthly,
      annualPremium: unemploymentInsuranceAnnualPremium,
      monthlyPremium: unemploymentInsuranceMonthlyPremium,
      description: unemploymentInsurance.description,
    },
    pension: {
      employee: pensionEmployee,
      employer: pensionEmployer,
      governmentSupport,
      employeeRate: settings.employeeRate,
      employerRate: employerCashRate,
      statutoryEmployerRate: settings.employerRate,
      governmentSupportRate,
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
    sourceUrls: Array.from(
      new Set([
        UAE_SOURCE_URLS.personalIncomeTax,
        UAE_SOURCE_URLS.naturalPersonWages,
        UAE_SOURCE_URLS.unemploymentInsurance,
        UAE_SOURCE_URLS.mohreUnemploymentInsurance,
        settings.sourceUrl,
        UAE_SOURCE_URLS.contributionSalaryTiming,
        UAE_SOURCE_URLS.emirateRegistration,
        UAE_SOURCE_URLS.gccRegistration,
      ]),
    ),
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
      unemploymentInsuranceCategory: "category2",
      iloeBasicSalaryMonthly: 0,
      pensionContributionSalaryMonthly: 0,
      contributions: {},
    };
  },
};
