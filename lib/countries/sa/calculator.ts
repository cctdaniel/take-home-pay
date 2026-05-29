import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { SA_CONFIG } from "./config";
import {
  SA_CONTRIBUTION_SALARY_SHARE,
  SA_GOSI_EMPLOYEE_RATE,
  SA_GOSI_MONTHLY_CAP,
  SA_PERSONAL_INCOME_TAX_RATE,
  SA_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { SABreakdown, SACalculatorInputs, SATaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { calculateSalaryShareContributionBase } from "../employee-contribution-base";

export function calculateSA(inputs: SACalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const isSaudiNational = inputs.nationality === "saudi_national";
  const contributionSalary = calculateSalaryShareContributionBase({
    grossSalary: grossIncome,
    applies: isSaudiNational,
    salaryShare: SA_CONTRIBUTION_SALARY_SHARE,
    monthlyCap: SA_GOSI_MONTHLY_CAP,
  });
  const incomeTax = 0;
  const gosiEmployee = roundCurrency(
    contributionSalary.annual * SA_GOSI_EMPLOYEE_RATE,
  );

  const taxes: SATaxBreakdown = {
    type: "SA",
    totalIncomeTax: incomeTax,
    incomeTax,
    gosiEmployee,
  };
  const totalTax = incomeTax + gosiEmployee;
  const totalDeductions = totalTax;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: SABreakdown = {
    type: "SA",
    grossIncome,
    nationality: inputs.nationality,
    contributionSalaryAnnual: contributionSalary.annual,
    contributionSalaryMonthly: contributionSalary.monthly,
    incomeTaxRate: SA_PERSONAL_INCOME_TAX_RATE,
    gosi: {
      employeeRate: isSaudiNational ? SA_GOSI_EMPLOYEE_RATE : 0,
      employee: gosiEmployee,
      monthlyCap: SA_GOSI_MONTHLY_CAP,
      salaryShare: SA_CONTRIBUTION_SALARY_SHARE,
    },
    voluntaryContributions: {
      total: 0,
    },
    assumptions: [
      "No personal income tax on salary is modeled.",
      "GOSI employee contribution of 10% applies to Saudi nationals on a basic-plus-housing proxy of 70% of gross, capped monthly.",
      "Expatriates are modeled with no employee GOSI deduction.",
    ],
    sourceUrls: Object.values(SA_SOURCE_URLS),
  };

  return {
    country: "SA",
    currency: "SAR",
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

export const SACalculator: CountryCalculator = {
  countryCode: "SA",
  config: SA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SA") {
      throw new Error("SACalculator can only calculate SA inputs");
    }
    return calculateSA(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): SACalculatorInputs {
    return {
      country: "SA",
      grossSalary: 360_000,
      payFrequency: "monthly",
      nationality: "expatriate",
      contributions: {},
    };
  },
};
