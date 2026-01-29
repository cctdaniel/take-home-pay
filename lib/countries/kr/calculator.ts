// ============================================================================
// SOUTH KOREA CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CountryCalculator,
  CalculatorInputs,
  CalculationResult,
  KRCalculatorInputs,
  KRTaxBreakdown,
  KRBreakdown,
  KRTaxReliefInputs,
  RegionInfo,
  ContributionLimits,
  PayFrequency,
} from "../types";
import { KR_CONFIG } from "./config";
import {
  KR_SOCIAL_INSURANCE,
  KR_LOCAL_TAX_RATE,
  KR_TAX_DEDUCTIONS,
  calculateEmploymentIncomeDeduction,
  calculateProgressiveIncomeTax,
  calculateNationalPension,
  calculateHealthInsurance,
  calculateLongTermCare,
  calculateEmploymentInsurance,
  calculateWageEarnerTaxCredit,
  calculateChildTaxCredit,
} from "./constants/tax-brackets-2026";

// Default tax reliefs (no dependents)
const DEFAULT_KR_TAX_RELIEFS: KRTaxReliefInputs = {
  numberOfDependents: 0,
  numberOfChildrenUnder20: 0,
  numberOfChildrenUnder7: 0,
  personalPensionContribution: 0,
  insurancePremiums: 0,
  medicalExpenses: 0,
  educationExpenses: 0,
  donations: 0,
  monthlyRent: 0,
  isHomeowner: false,
  hasMealAllowance: false,
  hasChildcareAllowance: false,
};

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
// SOUTH KOREA CALCULATOR
// ============================================================================
export function calculateKR(inputs: KRCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, taxReliefs = DEFAULT_KR_TAX_RELIEFS } = inputs;

  // Monthly salary for social insurance calculations
  const monthlySalary = grossSalary / 12;

  // ============================================================================
  // STEP 1: Calculate Social Insurance Contributions (mandatory)
  // ============================================================================

  // National Pension - calculated monthly then annualized
  const monthlyNationalPension = calculateNationalPension(monthlySalary);
  const annualNationalPension = monthlyNationalPension * 12;

  // Health Insurance - calculated monthly then annualized
  const monthlyHealthInsurance = calculateHealthInsurance(monthlySalary);
  const annualHealthInsurance = monthlyHealthInsurance * 12;

  // Long-term Care Insurance - based on health insurance
  const monthlyLongTermCare = calculateLongTermCare(monthlyHealthInsurance);
  const annualLongTermCare = monthlyLongTermCare * 12;

  // Employment Insurance - calculated monthly then annualized
  const monthlyEmploymentInsurance = calculateEmploymentInsurance(monthlySalary);
  const annualEmploymentInsurance = monthlyEmploymentInsurance * 12;

  // Total social insurance
  const totalSocialInsurance =
    annualNationalPension +
    annualHealthInsurance +
    annualLongTermCare +
    annualEmploymentInsurance;

  // ============================================================================
  // STEP 2: Calculate Deductions (소득공제)
  // ============================================================================

  // Employment income deduction (근로소득공제)
  const employmentIncomeDeduction = calculateEmploymentIncomeDeduction(grossSalary);

  // Calculate employment income (근로소득금액) = gross - employment income deduction
  const employmentIncome = Math.max(0, grossSalary - employmentIncomeDeduction);

  // Basic deduction for taxpayer (기본공제) - ₩1.5M
  const basicDeduction = KR_TAX_DEDUCTIONS.basicDeduction;

  // Dependent deduction (인적공제) - ₩1.5M per dependent
  const dependentDeduction = taxReliefs.numberOfDependents * KR_TAX_DEDUCTIONS.dependentDeduction;

  // Child deduction (자녀공제) - ₩1.5M per child under 20
  const childDeduction = taxReliefs.numberOfChildrenUnder20 * KR_TAX_DEDUCTIONS.childDeduction;

  // Additional child deduction for children under 7 (6세 이하 추가공제) - ₩1M per child
  const childUnder7Deduction = taxReliefs.numberOfChildrenUnder7 * KR_TAX_DEDUCTIONS.childUnder7Deduction;

  // Total personal deductions
  const totalPersonalDeductions = basicDeduction + dependentDeduction + childDeduction + childUnder7Deduction;

  // Total deductions including social insurance (which is deductible)
  const totalDeductionsFromIncome = totalPersonalDeductions + totalSocialInsurance;

  // Taxable income = employment income - deductions
  const taxableIncome = Math.max(0, employmentIncome - totalDeductionsFromIncome);

  // ============================================================================
  // STEP 3: Calculate Tax and Credits (세액공제)
  // ============================================================================

  // Calculate gross income tax using progressive brackets
  const grossIncomeTax = calculateProgressiveIncomeTax(taxableIncome);

  // Calculate wage earner tax credit (근로소득세액공제)
  const wageEarnerTaxCredit = calculateWageEarnerTaxCredit(grossIncomeTax);

  // Standard tax credit for wage earners who don't itemize (표준세액공제)
  const standardTaxCredit = KR_TAX_DEDUCTIONS.standardTaxCredit;

  // Child tax credit (자녀세액공제) - based on children under 20
  const childTaxCredit = calculateChildTaxCredit(taxReliefs.numberOfChildrenUnder20);

  // Total tax credits
  const totalTaxCredits = wageEarnerTaxCredit + standardTaxCredit + childTaxCredit;

  // Final income tax after credits
  const finalIncomeTax = Math.max(0, grossIncomeTax - totalTaxCredits);

  // Local income tax (10% of national income tax)
  const localIncomeTax = Math.round(finalIncomeTax * KR_LOCAL_TAX_RATE);

  // Total income tax (national + local)
  const totalIncomeTax = finalIncomeTax + localIncomeTax;

  // ============================================================================
  // STEP 3: Handle Non-Residents
  // Non-residents are typically taxed at a flat rate or withholding rate
  // ============================================================================
  let adjustedIncomeTax = totalIncomeTax;
  if (residencyType === "non_resident") {
    // Non-residents are typically taxed at a flat 19% withholding rate
    // or progressive rate, whichever is higher
    const flatTaxRate = 0.19;
    const flatTax = Math.round(grossSalary * flatTaxRate);
    adjustedIncomeTax = Math.max(totalIncomeTax, flatTax);
  }

  // ============================================================================
  // STEP 4: Build Results
  // ============================================================================

  // Tax breakdown
  const taxes: KRTaxBreakdown = {
    totalIncomeTax: adjustedIncomeTax,
    incomeTax: residencyType === "non_resident" ? adjustedIncomeTax - localIncomeTax : finalIncomeTax,
    localIncomeTax: residencyType === "non_resident" ? 0 : localIncomeTax,
    nationalPension: annualNationalPension,
    nationalHealthInsurance: annualHealthInsurance,
    longTermCareInsurance: annualLongTermCare,
    employmentInsurance: annualEmploymentInsurance,
  };

  // Total tax = income tax + social insurance
  const totalTax = adjustedIncomeTax + totalSocialInsurance;

  // No voluntary deductions for KR currently
  const totalDeductions = totalTax;

  // Net salary
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate (income tax only, not social insurance)
  const effectiveTaxRate = grossSalary > 0 ? adjustedIncomeTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Detailed breakdown
  const breakdown: KRBreakdown = {
    type: "KR",
    taxableIncome,
    nonTaxableIncome: {
      mealAllowance: 0, // Not yet implemented
      childcareAllowance: 0, // Not yet implemented
      total: 0,
    },
    socialInsurance: {
      nationalPension: annualNationalPension,
      nationalPensionRate: KR_SOCIAL_INSURANCE.nationalPension.employeeRate,
      nationalPensionCeiling: KR_SOCIAL_INSURANCE.nationalPension.monthlyCeiling * 12,
      healthInsurance: annualHealthInsurance,
      healthInsuranceRate: KR_SOCIAL_INSURANCE.healthInsurance.employeeRate,
      longTermCare: annualLongTermCare,
      longTermCareRate: KR_SOCIAL_INSURANCE.longTermCare.rate,
      employmentInsurance: annualEmploymentInsurance,
      employmentInsuranceRate: KR_SOCIAL_INSURANCE.employmentInsurance.employeeRate,
      totalSocialInsurance,
    },
    incomeDeductions: {
      employmentIncomeDeduction,
      basicDeduction,
      dependentDeduction,
      childDeduction,
      childUnder7Deduction,
      socialInsuranceDeduction: totalSocialInsurance, // Social insurance is deductible
      totalDeductions: totalPersonalDeductions + employmentIncomeDeduction + totalSocialInsurance,
    },
    taxCredits: {
      wageEarnerCredit: wageEarnerTaxCredit,
      standardCredit: standardTaxCredit,
      childTaxCredit,
      pensionCredit: 0, // Not yet implemented
      insuranceCredit: 0, // Not yet implemented
      medicalCredit: 0, // Not yet implemented
      educationCredit: 0, // Not yet implemented
      donationCredit: 0, // Not yet implemented
      rentCredit: 0, // Not yet implemented
      totalCredits: totalTaxCredits,
    },
    taxDetails: {
      grossIncomeTax,
      finalIncomeTax,
      localIncomeTax,
      totalIncomeTax: adjustedIncomeTax,
    },
  };

  return {
    country: "KR",
    currency: "KRW",
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

// ============================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ============================================================================
export const KRCalculator: CountryCalculator = {
  countryCode: "KR",
  config: KR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "KR") {
      throw new Error("KRCalculator can only calculate KR inputs");
    }
    return calculateKR(inputs as KRCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    // South Korea has no regional tax subdivisions
    return [];
  },

  getContributionLimits(): ContributionLimits {
    // All social insurance is mandatory - no optional contribution limits
    return {
      nationalPension: {
        limit: KR_SOCIAL_INSURANCE.nationalPension.monthlyCeiling * 12,
        name: "National Pension",
        description: "Mandatory pension contribution (4.5% employee share)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): KRCalculatorInputs {
    return {
      country: "KR",
      grossSalary: 50000000, // ₩50M - typical annual salary
      payFrequency: "monthly",
      residencyType: "resident",
      contributions: {},
      taxReliefs: DEFAULT_KR_TAX_RELIEFS,
    };
  },
};
