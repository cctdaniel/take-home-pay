// ============================================================================
// TAIWAN CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  ContributionLimits,
  PayFrequency,
  RegionInfo,
  TWBreakdown,
  TWCalculatorInputs,
  TWTaxBreakdown,
} from "../types";
import { TW_CONFIG } from "./config";
import {
  TW_EXEMPTIONS_2026,
  TW_STANDARD_DEDUCTION_2026,
  TW_SPECIAL_DEDUCTIONS_2026,
  calculateProgressiveTax,
  calculateSocialInsurance,
  TW_LABOR_INSURANCE_2026,
  TW_EMPLOYMENT_INSURANCE_2026,
  TW_NHI_2026,
  TW_LABOR_PENSION_2026,
} from "./constants/tax-brackets-2026";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
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

// ============================================================================
// TAIWAN TAX CALCULATION
// ============================================================================
function calculateTWIncomeTax(inputs: TWCalculatorInputs) {
  const { grossSalary, taxReliefs, contributions } = inputs;
  const monthlySalary = grossSalary / 12;

  // ==========================================================================
  // STEP 1: Calculate Social Insurance Contributions (Employee Portion)
  // ==========================================================================
  const socialInsurance = calculateSocialInsurance(monthlySalary);
  const annualSocialInsurance = {
    laborInsurance: socialInsurance.laborInsurance * 12,
    employmentInsurance: socialInsurance.employmentInsurance * 12,
    nhi: socialInsurance.nhi * 12,
    total: socialInsurance.total * 12,
  };

  // Voluntary labor pension contribution (employee can contribute 0-6%)
  const voluntaryPensionContribution = Math.min(
    contributions.voluntaryPensionContribution || 0,
    Math.min(monthlySalary, TW_LABOR_PENSION_2026.monthlyWageCap) *
      TW_LABOR_PENSION_2026.employeeVoluntaryMaxRate *
      12
  );

  // ==========================================================================
  // STEP 2: Calculate Deductions and Exemptions
  // ==========================================================================
  
  // Standard deduction (choose itemized or standard - we use standard for simplicity)
  const standardDeduction = taxReliefs.isMarried
    ? TW_STANDARD_DEDUCTION_2026.married
    : TW_STANDARD_DEDUCTION_2026.single;

  // Personal exemption
  const personalExemption = TW_EXEMPTIONS_2026.personal;

  // Special salary deduction
  const specialSalaryDeduction = TW_SPECIAL_DEDUCTIONS_2026.salary;

  // Disability deduction
  const disabilityDeduction = taxReliefs.hasDisability
    ? TW_SPECIAL_DEDUCTIONS_2026.disability
    : 0;

  // Total deductions and exemptions
  const totalDeductionsAndExemptions =
    standardDeduction +
    personalExemption +
    specialSalaryDeduction +
    disabilityDeduction +
    voluntaryPensionContribution;

  // ==========================================================================
  // STEP 3: Calculate Taxable Income
  // ==========================================================================
  // Formula: Gross Salary - (Social Insurance + Deductions + Exemptions)
  const taxableIncomeBeforeGoldCard = Math.max(
    0,
    grossSalary - annualSocialInsurance.total - totalDeductionsAndExemptions
  );

  // ==========================================================================
  // STEP 4: Apply Employment Gold Card Tax Benefit (if applicable)
  // ==========================================================================
  // Gold Card holders: 50% of income above NT$3M is tax-exempt for first 5 years
  const GOLD_CARD_THRESHOLD = 3_000_000;
  let goldCardExemption = 0;
  let taxableIncome = taxableIncomeBeforeGoldCard;

  if (taxReliefs.isGoldCardHolder && taxableIncomeBeforeGoldCard > GOLD_CARD_THRESHOLD) {
    goldCardExemption = (taxableIncomeBeforeGoldCard - GOLD_CARD_THRESHOLD) * 0.5;
    taxableIncome = taxableIncomeBeforeGoldCard - goldCardExemption;
  }

  // ==========================================================================
  // STEP 5: Calculate Income Tax
  // ==========================================================================
  const taxResult = calculateProgressiveTax(taxableIncome);

  return {
    // Income tax
    incomeTax: taxResult.totalTax,
    taxableIncome,
    taxableIncomeBeforeGoldCard,
    goldCardExemption,
    goldCardThreshold: GOLD_CARD_THRESHOLD,
    isGoldCardApplied: taxReliefs.isGoldCardHolder && goldCardExemption > 0,

    // Bracket taxes based on final taxable income
    bracketTaxes: taxResult.bracketTaxes,

    // Social insurance
    socialInsurance: annualSocialInsurance,
    socialInsuranceMonthly: socialInsurance,

    // Deductions breakdown
    deductions: {
      standardDeduction,
      personalExemption,
      specialSalaryDeduction,
      disabilityDeduction,
      voluntaryPensionContribution,
      totalDeductionsAndExemptions,
    },

    // Monthly values for reference
    monthlySalary,
  };
}

// ============================================================================
// TAIWAN CALCULATOR
// ============================================================================
export function calculateTW(inputs: TWCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency } = inputs;

  const taxResult = calculateTWIncomeTax(inputs);

  // Build tax breakdown
  const taxes: TWTaxBreakdown = {
    totalIncomeTax: taxResult.incomeTax,
    incomeTax: taxResult.incomeTax,
    laborInsurance: taxResult.socialInsurance.laborInsurance,
    employmentInsurance: taxResult.socialInsurance.employmentInsurance,
    nhi: taxResult.socialInsurance.nhi,
  };

  // Total tax includes income tax + social insurance contributions
  const totalTax =
    taxes.incomeTax +
    taxes.laborInsurance +
    taxes.employmentInsurance +
    taxes.nhi;

  // Total deductions from gross
  const totalDeductions = totalTax;

  // Net salary after all deductions
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: TWBreakdown = {
    type: "TW",
    grossIncome: grossSalary,
    taxableIncome: taxResult.taxableIncome,

    // Gold Card tax benefit
    goldCard: {
      isApplied: taxResult.isGoldCardApplied,
      threshold: taxResult.goldCardThreshold,
      exemptionAmount: taxResult.goldCardExemption,
      taxableIncomeBeforeExemption: taxResult.taxableIncomeBeforeGoldCard,
    },
    
    // Social insurance breakdown
    socialInsurance: {
      laborInsurance: taxResult.socialInsurance.laborInsurance,
      employmentInsurance: taxResult.socialInsurance.employmentInsurance,
      nhi: taxResult.socialInsurance.nhi,
      total: taxResult.socialInsurance.total,
      // Monthly values
      monthlyLaborInsurance: taxResult.socialInsuranceMonthly.laborInsurance,
      monthlyEmploymentInsurance: taxResult.socialInsuranceMonthly.employmentInsurance,
      monthlyNhi: taxResult.socialInsuranceMonthly.nhi,
      monthlyTotal: taxResult.socialInsuranceMonthly.total,
      // Caps
      laborInsuranceCap: TW_LABOR_INSURANCE_2026.monthlyWageCap,
      employmentInsuranceCap: TW_EMPLOYMENT_INSURANCE_2026.monthlyWageCap,
      nhiCap: TW_NHI_2026.monthlyWageCap,
      // Rates
      laborInsuranceRate: TW_LABOR_INSURANCE_2026.employeeEffectiveRate,
      employmentInsuranceRate: TW_EMPLOYMENT_INSURANCE_2026.employeeEffectiveRate,
      nhiRate: TW_NHI_2026.employeeEffectiveRate,
    },

    // Deductions breakdown
    deductions: {
      standardDeduction: taxResult.deductions.standardDeduction,
      personalExemption: taxResult.deductions.personalExemption,
      specialSalaryDeduction: taxResult.deductions.specialSalaryDeduction,
      disabilityDeduction: taxResult.deductions.disabilityDeduction,
      voluntaryPensionContribution: taxResult.deductions.voluntaryPensionContribution,
      totalDeductionsAndExemptions: taxResult.deductions.totalDeductionsAndExemptions,
    },

    // Tax bracket breakdown
    bracketTaxes: taxResult.bracketTaxes,

    // Voluntary contributions
    voluntaryContributions: {
      voluntaryPensionContribution: taxResult.deductions.voluntaryPensionContribution,
      pensionMaxRate: TW_LABOR_PENSION_2026.employeeVoluntaryMaxRate,
      pensionMonthlyCap: TW_LABOR_PENSION_2026.monthlyWageCap,
    },
  };

  return {
    country: "TW",
    currency: "TWD",
    grossSalary,
    taxableIncome: taxResult.taxableIncome,
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

// ============================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ============================================================================
export const TWCalculator: CountryCalculator = {
  countryCode: "TW",
  config: TW_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "TW") {
      throw new Error("TWCalculator can only calculate TW inputs");
    }
    return calculateTW(inputs as TWCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    // Taiwan has no regional tax subdivisions
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      voluntaryPensionContribution: {
        limit: TW_LABOR_PENSION_2026.monthlyWageCap * TW_LABOR_PENSION_2026.employeeVoluntaryMaxRate * 12,
        name: "Voluntary Labor Pension Contribution",
        description: "Employee can voluntarily contribute 0-6% of monthly salary (capped at NT$150,000)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): TWCalculatorInputs {
    return {
      country: "TW",
      grossSalary: 720_000, // NT$60,000 monthly (typical white-collar salary)
      payFrequency: "monthly",
      contributions: {
        voluntaryPensionContribution: 0,
      },
      taxReliefs: {
        isMarried: false,
        hasDisability: false,
        isGoldCardHolder: false,
      },
    };
  },
};
