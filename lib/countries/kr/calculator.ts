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
  KR_FOREIGN_WORKER_FLAT_TAX_RATE,
  KR_TAX_DEDUCTIONS,
  KR_TAX_CREDITS,
  calculateEmploymentIncomeDeduction,
  calculateProgressiveIncomeTax,
  calculateNationalPension,
  calculateHealthInsurance,
  calculateLongTermCare,
  calculateEmploymentInsurance,
  calculateWageEarnerTaxCredit,
  calculateChildTaxCredit,
  calculatePensionCredit,
  calculateNonTaxableAllowances,
  calculateInsuranceCredit,
  calculateMedicalCredit,
  calculateEducationCredit,
  calculateDonationCredit,
  calculateRentCredit,
} from "./constants/tax-brackets-2026";

// Default tax reliefs (no dependents)
const DEFAULT_KR_TAX_RELIEFS: KRTaxReliefInputs = {
  foreignWorkerFlatTax: false,
  numberOfDependents: 0,
  numberOfChildrenUnder20: 0,
  numberOfChildrenUnder7: 0,
  personalPensionContribution: 0,
  insurancePremiums: 0,
  medicalExpenses: 0,
  educationExpenses: 0,
  donations: 0,
  monthlyRent: 0,
  annualRentPaid: 0,
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
  const {
    grossSalary,
    payFrequency,
    residencyType,
    taxReliefs: inputTaxReliefs = DEFAULT_KR_TAX_RELIEFS,
  } = inputs;
  const taxReliefs: KRTaxReliefInputs = {
    ...DEFAULT_KR_TAX_RELIEFS,
    ...inputTaxReliefs,
  };
  const usesForeignWorkerFlatTax = taxReliefs.foreignWorkerFlatTax === true;

  // ============================================================================
  // STEP 0: Calculate Non-Taxable Allowances (비과세 소득)
  // These amounts are excluded from taxable income
  // ============================================================================
  const nonTaxableAllowances = calculateNonTaxableAllowances(
    taxReliefs.hasMealAllowance,
    taxReliefs.hasChildcareAllowance
  );

  // Taxable gross salary = gross salary - non-taxable allowances
  const taxableGrossSalary = Math.max(0, grossSalary - nonTaxableAllowances.total);

  // Monthly salary for social insurance calculations (based on full gross, not taxable)
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

  // Employment income deduction (근로소득공제) - based on taxable gross (after non-taxable)
  const employmentIncomeDeduction = calculateEmploymentIncomeDeduction(taxableGrossSalary);

  // Calculate employment income (근로소득금액) = taxable gross - employment income deduction
  const employmentIncome = Math.max(0, taxableGrossSalary - employmentIncomeDeduction);

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

  // Personal pension credit (연금저축/IRP 세액공제)
  // Rate depends on income: 16.5% if ≤ ₩55M, 13.2% if > ₩55M
  const pensionCredit = calculatePensionCredit(
    taxReliefs.personalPensionContribution,
    grossSalary
  );

  // Insurance premium credit (보험료 세액공제) - 12%, capped at ₩1M
  const insuranceCredit = calculateInsuranceCredit(taxReliefs.insurancePremiums);

  // Medical expense credit (의료비 세액공제) - 15% of amount exceeding 3% of income
  const medicalCredit = calculateMedicalCredit(taxReliefs.medicalExpenses, grossSalary);

  // Education expense credit (교육비 세액공제) - 15%
  const educationCredit = calculateEducationCredit(taxReliefs.educationExpenses);

  // Donation credit (기부금 세액공제) - 15% up to ₩10M, 30% above
  const donationCredit = calculateDonationCredit(taxReliefs.donations);

  // Rent credit (월세 세액공제) - 15% or 17% depending on income
  // Only applies if not a homeowner
  const annualRentPaid = Math.max(
    0,
    taxReliefs.annualRentPaid ?? (taxReliefs.monthlyRent ?? 0) * 12,
  );
  const rentCredit = taxReliefs.isHomeowner
    ? 0
    : calculateRentCredit(annualRentPaid, grossSalary);

  // Total tax credits
  const totalTaxCredits =
    wageEarnerTaxCredit +
    standardTaxCredit +
    childTaxCredit +
    pensionCredit +
    insuranceCredit +
    medicalCredit +
    educationCredit +
    donationCredit +
    rentCredit;

  // Final income tax after credits
  const finalIncomeTax = Math.max(0, grossIncomeTax - totalTaxCredits);

  // Local income tax (10% of national income tax)
  const localIncomeTax = Math.round(finalIncomeTax * KR_LOCAL_TAX_RATE);

  // Total income tax (national + local)
  const totalIncomeTax = finalIncomeTax + localIncomeTax;

  const foreignWorkerFlatTaxBase = grossSalary;
  const foreignWorkerFlatNationalTax = Math.round(
    foreignWorkerFlatTaxBase * KR_FOREIGN_WORKER_FLAT_TAX_RATE,
  );
  const foreignWorkerFlatLocalTax = Math.round(
    foreignWorkerFlatNationalTax * KR_LOCAL_TAX_RATE,
  );
  const foreignWorkerFlatTotalTax =
    foreignWorkerFlatNationalTax + foreignWorkerFlatLocalTax;

  // ============================================================================
  // STEP 3B: Apply foreign-worker flat tax or non-resident flat withholding proxy
  // ============================================================================
  let appliedNationalIncomeTax = finalIncomeTax;
  let appliedLocalIncomeTax = localIncomeTax;
  let appliedTotalIncomeTax = totalIncomeTax;
  let foreignWorkerFlatTaxApplied = false;
  let nonResidentFlatTaxApplied = false;

  if (usesForeignWorkerFlatTax) {
    appliedNationalIncomeTax = foreignWorkerFlatNationalTax;
    appliedLocalIncomeTax = foreignWorkerFlatLocalTax;
    appliedTotalIncomeTax = foreignWorkerFlatTotalTax;
    foreignWorkerFlatTaxApplied = true;
  } else if (
    residencyType === "non_resident" &&
    foreignWorkerFlatTotalTax > totalIncomeTax
  ) {
    appliedNationalIncomeTax = foreignWorkerFlatNationalTax;
    appliedLocalIncomeTax = foreignWorkerFlatLocalTax;
    appliedTotalIncomeTax = foreignWorkerFlatTotalTax;
    nonResidentFlatTaxApplied = true;
  }

  // ============================================================================
  // STEP 4: Build Results
  // ============================================================================

  const taxes: KRTaxBreakdown = {
    totalIncomeTax: appliedTotalIncomeTax,
    incomeTax: appliedNationalIncomeTax,
    localIncomeTax: appliedLocalIncomeTax,
    nationalPension: annualNationalPension,
    nationalHealthInsurance: annualHealthInsurance,
    longTermCareInsurance: annualLongTermCare,
    employmentInsurance: annualEmploymentInsurance,
  };

  // Total tax = income tax + social insurance
  const totalTax = appliedTotalIncomeTax + totalSocialInsurance;

  const voluntaryPersonalPensionContribution = usesForeignWorkerFlatTax
    ? 0
    : Math.min(
        Math.max(0, taxReliefs.personalPensionContribution),
        KR_TAX_CREDITS.pensionCredit.maxContribution,
      );
  const totalVoluntaryContributions = voluntaryPersonalPensionContribution;
  const totalDeductions = totalTax + totalVoluntaryContributions;

  // Net salary
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate (income tax + social insurance - all mandatory contributions)
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const reportedTaxableIncome = usesForeignWorkerFlatTax
    ? foreignWorkerFlatTaxBase
    : taxableIncome;

  // Detailed breakdown
  const breakdown: KRBreakdown = {
    type: "KR",
    taxableIncome: reportedTaxableIncome,
    nonTaxableIncome: usesForeignWorkerFlatTax
      ? {
          mealAllowance: 0,
          childcareAllowance: 0,
          total: 0,
        }
      : {
          mealAllowance: nonTaxableAllowances.mealAllowance,
          childcareAllowance: nonTaxableAllowances.childcareAllowance,
          total: nonTaxableAllowances.total,
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
    incomeDeductions: usesForeignWorkerFlatTax
      ? {
          employmentIncomeDeduction: 0,
          basicDeduction: 0,
          dependentDeduction: 0,
          childDeduction: 0,
          childUnder7Deduction: 0,
          socialInsuranceDeduction: 0,
          totalDeductions: 0,
        }
      : {
          employmentIncomeDeduction,
          basicDeduction,
          dependentDeduction,
          childDeduction,
          childUnder7Deduction,
          socialInsuranceDeduction: totalSocialInsurance, // Social insurance is deductible
          totalDeductions:
            totalPersonalDeductions + employmentIncomeDeduction + totalSocialInsurance,
        },
    taxCredits: usesForeignWorkerFlatTax
      ? {
          wageEarnerCredit: 0,
          standardCredit: 0,
          childTaxCredit: 0,
          pensionCredit: 0,
          insuranceCredit: 0,
          medicalCredit: 0,
          educationCredit: 0,
          donationCredit: 0,
          rentCredit: 0,
          totalCredits: 0,
        }
      : {
          wageEarnerCredit: wageEarnerTaxCredit,
          standardCredit: standardTaxCredit,
          childTaxCredit,
          pensionCredit, // Personal pension credit (연금저축/IRP)
          insuranceCredit, // 보험료 세액공제
          medicalCredit, // 의료비 세액공제
          educationCredit, // 교육비 세액공제
          donationCredit, // 기부금 세액공제
          rentCredit, // 월세 세액공제
          totalCredits: totalTaxCredits,
        },
    voluntaryContributions: {
      personalPensionContribution: voluntaryPersonalPensionContribution,
      total: totalVoluntaryContributions,
    },
    taxDetails: {
      grossIncomeTax: usesForeignWorkerFlatTax
        ? foreignWorkerFlatNationalTax
        : grossIncomeTax,
      finalIncomeTax: appliedNationalIncomeTax,
      localIncomeTax: appliedLocalIncomeTax,
      totalIncomeTax: appliedTotalIncomeTax,
      foreignWorkerFlatTaxApplied,
      foreignWorkerFlatTaxBase: usesForeignWorkerFlatTax
        ? foreignWorkerFlatTaxBase
        : undefined,
      foreignWorkerFlatNationalTax: usesForeignWorkerFlatTax
        ? foreignWorkerFlatNationalTax
        : undefined,
      foreignWorkerFlatLocalTax: usesForeignWorkerFlatTax
        ? foreignWorkerFlatLocalTax
        : undefined,
      ordinaryTotalIncomeTax: usesForeignWorkerFlatTax
        ? totalIncomeTax
        : undefined,
      nonResidentFlatTaxApplied,
    },
  };

  return {
    country: "KR",
    currency: "KRW",
    grossSalary,
    taxableIncome: reportedTaxableIncome,
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
    // Mandatory social insurance is automatic payroll logic, not an optional
    // contribution slider.
    return {};
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
