import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  VNBreakdown,
  VNCalculatorInputs,
  VNTaxBreakdown,
} from "../types";
import { VN_CONFIG } from "./config";
import {
  calculateVNProgressiveTax,
  VN_DEPENDENT_DEDUCTION_ANNUAL,
  VN_PERSONAL_DEDUCTION_ANNUAL,
  VN_SOCIAL_INSURANCE_2026,
} from "./constants/tax-parameters-2026";

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
  return Math.round(value);
}

function calculateSocialInsurance(monthlySalary: number) {
  const si = VN_SOCIAL_INSURANCE_2026;
  const ceiling = si.baseSalary * si.ceilingMultiplier;
  const cappedMonthly = Math.min(monthlySalary, ceiling);

  const socialMonthly = roundCurrency(cappedMonthly * si.socialInsuranceRate);
  const healthMonthly = roundCurrency(cappedMonthly * si.healthInsuranceRate);
  const unemploymentMonthly = roundCurrency(
    Math.min(monthlySalary, si.regionalMinimumWageTier1 * 20) *
      si.unemploymentInsuranceRate
  );

  return {
    socialInsurance: {
      rate: si.socialInsuranceRate,
      employee: socialMonthly * 12,
      ceiling,
    },
    healthInsurance: {
      rate: si.healthInsuranceRate,
      employee: healthMonthly * 12,
      ceiling,
    },
    unemploymentInsurance: {
      rate: si.unemploymentInsuranceRate,
      employee: unemploymentMonthly * 12,
      ceiling: si.regionalMinimumWageTier1 * 20,
    },
  };
}

export function calculateVN(inputs: VNCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, numberOfDependents } = inputs;
  const monthlySalary = grossSalary / 12;

  const socialInsurance = calculateSocialInsurance(monthlySalary);

  const totalSocialInsurance =
    socialInsurance.socialInsurance.employee +
    socialInsurance.healthInsurance.employee +
    socialInsurance.unemploymentInsurance.employee;

  // Deductions
  const personalDeduction = VN_PERSONAL_DEDUCTION_ANNUAL;
  const dependentDeduction =
    Math.max(0, numberOfDependents) * VN_DEPENDENT_DEDUCTION_ANNUAL;
  const totalDeductions = personalDeduction + dependentDeduction;

  // Taxable income = gross salary - social insurance - personal deductions
  const taxableIncome = Math.max(
    0,
    Math.round(grossSalary - totalSocialInsurance - totalDeductions)
  );

  const taxResult = calculateVNProgressiveTax(taxableIncome);

  const taxes: VNTaxBreakdown = {
    totalIncomeTax: taxResult.totalTax + totalSocialInsurance,
    incomeTax: taxResult.totalTax,
    socialInsurance: socialInsurance.socialInsurance.employee,
    healthInsurance: socialInsurance.healthInsurance.employee,
    unemploymentInsurance: socialInsurance.unemploymentInsurance.employee,
  };

  const totalTax = taxResult.totalTax + totalSocialInsurance;
  const netSalary = grossSalary - totalTax;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: VNBreakdown = {
    type: "VN",
    grossIncome: grossSalary,
    personalDeduction,
    dependentDeduction,
    numberOfDependents: Math.max(0, numberOfDependents),
    totalDeductions,
    taxableIncome,
    socialInsurance: socialInsurance.socialInsurance,
    healthInsurance: socialInsurance.healthInsurance,
    unemploymentInsurance: socialInsurance.unemploymentInsurance,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "VN",
    currency: "VND",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
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

export const VNCalculator: CountryCalculator = {
  countryCode: "VN",
  config: VN_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "VN") {
      throw new Error("VNCalculator can only calculate VN inputs");
    }
    return calculateVN(inputs as VNCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): VNCalculatorInputs {
    return {
      country: "VN",
      grossSalary: 240_000_000,
      payFrequency: "monthly",
      numberOfDependents: 0,
    };
  },
};
