import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { SA_CONFIG } from "./config";
import { SA_INCOME_TAX_RATE, SA_SOCIAL_INSURANCE_2026 } from "./constants/tax-year-2026";
import type { SABreakdown, SACalculatorInputs, SAEmploymentType, SATaxBreakdown } from "./types";
import { clampAmount } from "@/lib/utils";

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

export function calculateSA(inputs: SACalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, employmentType } = inputs;
  const isSaudiNational = employmentType === "saudi_national";
  const maxAnnualSalary = SA_SOCIAL_INSURANCE_2026.maxMonthlySalary * 12;
  const contributionSalary = clampAmount(grossSalary, maxAnnualSalary);

  const incomeTax = 0;
  const socialEmployeeRate = isSaudiNational ? SA_SOCIAL_INSURANCE_2026.employeeRate : 0;
  const socialEmployerRate = isSaudiNational ? SA_SOCIAL_INSURANCE_2026.employerRate : 0;
  const socialEmployee = roundCurrency(contributionSalary * socialEmployeeRate);
  const socialEmployer = roundCurrency(contributionSalary * socialEmployerRate);

  const taxes: SATaxBreakdown = {
    type: "SA",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsuranceEmployee: socialEmployee,
  };

  const totalTax = incomeTax + socialEmployee;
  const totalDeductions = totalTax;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: SABreakdown = {
    type: "SA",
    grossIncome: grossSalary,
    employmentType,
    isSaudiNational,
    taxableIncome: 0,
    incomeTaxRate: SA_INCOME_TAX_RATE,
    socialInsurance: {
      employee: socialEmployee,
      employeeRate: socialEmployeeRate,
      employer: socialEmployer,
      employerRate: socialEmployerRate,
      maxContributionSalary: maxAnnualSalary,
    },
    assumptions: [
      "Saudi Arabia imposes 0% personal income tax on salary.",
      isSaudiNational
        ? "GOSI social insurance contributions apply for Saudi nationals."
        : "Expatriates are exempt from GOSI social insurance contributions.",
      "Employer GOSI contributions are shown for reference but not deducted from take-home pay.",
    ],
    sourceUrls: [
      "https://zatca.gov.sa",
      "https://www.gosi.gov.sa",
    ],
  };

  return {
    country: "SA",
    currency: "SAR",
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

export const SACalculator: CountryCalculator = {
  countryCode: "SA",
  config: SA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SA") {
      throw new Error("SACalculator can only calculate SA inputs");
    }
    return calculateSA(inputs as SACalculatorInputs);
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
      grossSalary: 240_000,
      payFrequency: "monthly",
      employmentType: "expat",
      contributions: {},
    };
  },
};
