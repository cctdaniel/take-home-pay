import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { QA_CONFIG } from "./config";
import {
  QA_CONTRIBUTION_SALARY_SHARE,
  QA_PERSONAL_INCOME_TAX_RATE,
  QA_SOCIAL_INSURANCE_EMPLOYEE_RATE,
  QA_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { QABreakdown, QACalculatorInputs, QATaxBreakdown } from "./types";

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

export function calculateQA(inputs: QACalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const isQatariNational = inputs.nationality === "qatari_national";
  const monthlyContributionSalary = isQatariNational
    ? roundCurrency((grossIncome / 12) * QA_CONTRIBUTION_SALARY_SHARE)
    : 0;
  const contributionSalaryAnnual = roundCurrency(
    monthlyContributionSalary * 12,
  );
  const incomeTax = 0;
  const socialInsuranceEmployee = roundCurrency(
    contributionSalaryAnnual * QA_SOCIAL_INSURANCE_EMPLOYEE_RATE,
  );

  const taxes: QATaxBreakdown = {
    type: "QA",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsuranceEmployee,
  };
  const totalTax = incomeTax + socialInsuranceEmployee;
  const totalDeductions = totalTax;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: QABreakdown = {
    type: "QA",
    grossIncome,
    nationality: inputs.nationality,
    contributionSalaryAnnual,
    contributionSalaryMonthly: monthlyContributionSalary,
    incomeTaxRate: QA_PERSONAL_INCOME_TAX_RATE,
    socialInsurance: {
      employeeRate: isQatariNational ? QA_SOCIAL_INSURANCE_EMPLOYEE_RATE : 0,
      employee: socialInsuranceEmployee,
      salaryShare: QA_CONTRIBUTION_SALARY_SHARE,
    },
    voluntaryContributions: {
      total: 0,
    },
    assumptions: [
      "No personal income tax on salary is modeled.",
      "Employee social insurance of 5% applies to Qatari nationals on a basic-plus-housing proxy of 70% of gross.",
      "Expatriates are modeled with no employee social insurance deduction.",
    ],
    sourceUrls: Object.values(QA_SOURCE_URLS),
  };

  return {
    country: "QA",
    currency: "QAR",
    grossSalary: grossIncome,
    taxableIncome: 0,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const QACalculator: CountryCalculator = {
  countryCode: "QA",
  config: QA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "QA") {
      throw new Error("QACalculator can only calculate QA inputs");
    }
    return calculateQA(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): QACalculatorInputs {
    return {
      country: "QA",
      grossSalary: 360_000,
      payFrequency: "monthly",
      nationality: "expatriate",
      contributions: {},
    };
  },
};
