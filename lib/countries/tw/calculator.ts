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
  TW_BASIC_LIVING_EXPENSE_2025,
  TW_EXEMPTIONS_2026,
  TW_GOLD_CARD_2026,
  TW_ITEMIZED_DEDUCTIONS_2026,
  TW_STANDARD_DEDUCTION_2026,
  TW_SPECIAL_DEDUCTIONS_2026,
  TW_NON_RESIDENT_SALARY_TAX_RATE,
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

function clampAmount(value: number | undefined, max = Infinity): number {
  return Math.min(Math.max(0, value ?? 0), Math.max(0, max));
}

function getHouseholdMemberCount(inputs: TWCalculatorInputs): number {
  const { taxReliefs } = inputs;
  return (
    1 +
    (taxReliefs.isMarried ? 1 : 0) +
    Math.max(0, Math.floor(taxReliefs.numberOfDependents ?? 0)) +
    Math.max(0, Math.floor(taxReliefs.numberOfElderlyLinealAscendants ?? 0))
  );
}

// ============================================================================
// TAIWAN TAX CALCULATION
// ============================================================================
function calculateTWIncomeTax(inputs: TWCalculatorInputs) {
  const { grossSalary, taxReliefs, contributions, taxResidency } = inputs;
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
  const voluntaryPensionLimit =
    Math.min(monthlySalary, TW_LABOR_PENSION_2026.monthlyWageCap) *
    TW_LABOR_PENSION_2026.employeeVoluntaryMaxRate *
    12;
  const voluntaryPensionContribution =
    taxResidency === "resident"
      ? clampAmount(
          contributions.voluntaryPensionContribution,
          voluntaryPensionLimit,
        )
      : 0;

  if (taxResidency === "non_resident") {
    const incomeTax = Math.round(grossSalary * TW_NON_RESIDENT_SALARY_TAX_RATE);

    return {
      incomeTax,
      taxableIncome: grossSalary,
      taxableIncomeBeforeGoldCard: grossSalary,
      goldCardExemption: 0,
      goldCardThreshold: TW_GOLD_CARD_2026.salaryThreshold,
      isGoldCardApplied: false,
      bracketTaxes: [],
      socialInsurance: annualSocialInsurance,
      socialInsuranceMonthly: socialInsurance,
      deductions: {
        deductionMethod: taxReliefs.deductionMethod ?? "auto",
        deductionMethodApplied: "standard" as const,
        standardDeduction: 0,
        itemizedDeduction: 0,
        personalExemption: 0,
        dependentExemption: 0,
        elderlyLinealAscendantExemption: 0,
        specialSalaryDeduction: 0,
        disabilityDeduction: 0,
        savingsAndInvestmentDeduction: 0,
        collegeTuitionDeduction: 0,
        preschoolChildrenDeduction: 0,
        longTermCareDeduction: 0,
        rentDeduction: 0,
        basicLivingExpenseDifference: 0,
        charitableDonations: 0,
        insurancePremiums: 0,
        medicalAndMaternityExpenses: 0,
        mortgageInterest: 0,
        calamityLosses: 0,
        voluntaryPensionContribution,
        conditionalDeductionsAllowed: false,
        totalDeductionsAndExemptions: 0,
      },
      monthlySalary,
    };
  }

  // ==========================================================================
  // STEP 2: Calculate Deductions and Exemptions
  // ==========================================================================
  
  const householdMembers = getHouseholdMemberCount(inputs);

  const standardDeduction = taxReliefs.isMarried
    ? TW_STANDARD_DEDUCTION_2026.married
    : TW_STANDARD_DEDUCTION_2026.single;

  const itemizedDeductions = {
    charitableDonations: Math.min(
      clampAmount(taxReliefs.charitableDonations),
      grossSalary * TW_ITEMIZED_DEDUCTIONS_2026.charitableDonationGrossIncomeCapRate,
    ),
    insurancePremiums: Math.min(
      clampAmount(taxReliefs.insurancePremiums),
      householdMembers * TW_ITEMIZED_DEDUCTIONS_2026.insurancePremiumPerPersonCap,
    ),
    medicalAndMaternityExpenses: clampAmount(
      taxReliefs.medicalAndMaternityExpenses,
    ),
    mortgageInterest: Math.min(
      clampAmount(taxReliefs.mortgageInterest),
      Math.max(
        0,
        TW_ITEMIZED_DEDUCTIONS_2026.mortgageInterestCap -
          clampAmount(
            taxReliefs.savingsAndInvestmentIncome,
            TW_SPECIAL_DEDUCTIONS_2026.savingsAndInvestment,
          ),
      ),
    ),
    calamityLosses: clampAmount(taxReliefs.calamityLosses),
  };
  const itemizedDeduction = Object.values(itemizedDeductions).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const requestedDeductionMethod = taxReliefs.deductionMethod ?? "auto";
  const deductionMethodApplied: "standard" | "itemized" =
    requestedDeductionMethod === "itemized" ||
    (requestedDeductionMethod === "auto" && itemizedDeduction > standardDeduction)
      ? "itemized"
      : "standard";
  const standardOrItemizedDeduction =
    deductionMethodApplied === "itemized" ? itemizedDeduction : standardDeduction;

  const personalExemption =
    (1 + (taxReliefs.isMarried ? 1 : 0)) * TW_EXEMPTIONS_2026.personal;
  const dependentExemption =
    Math.max(0, Math.floor(taxReliefs.numberOfDependents ?? 0)) *
    TW_EXEMPTIONS_2026.personal;
  const elderlyLinealAscendantExemption =
    Math.max(0, Math.floor(taxReliefs.numberOfElderlyLinealAscendants ?? 0)) *
    TW_EXEMPTIONS_2026.personalElderly;
  const totalExemptions =
    personalExemption + dependentExemption + elderlyLinealAscendantExemption;

  const specialSalaryDeduction = Math.min(
    grossSalary,
    TW_SPECIAL_DEDUCTIONS_2026.salary,
  );
  const disabilityPersons = Math.max(
    taxReliefs.hasDisability ? 1 : 0,
    Math.floor(taxReliefs.disabledPersons ?? 0),
  );
  const disabilityDeduction =
    disabilityPersons * TW_SPECIAL_DEDUCTIONS_2026.disability;
  const savingsAndInvestmentDeduction = clampAmount(
    taxReliefs.savingsAndInvestmentIncome,
    TW_SPECIAL_DEDUCTIONS_2026.savingsAndInvestment,
  );
  const collegeTuitionDeduction =
    Math.max(0, Math.floor(taxReliefs.collegeTuitionChildren ?? 0)) *
    TW_SPECIAL_DEDUCTIONS_2026.collegeTuition;
  const preschoolChildren = Math.max(
    0,
    Math.floor(taxReliefs.preschoolChildren ?? 0),
  );
  const preschoolChildrenDeductionCandidate =
    preschoolChildren > 0
      ? TW_SPECIAL_DEDUCTIONS_2026.preschoolFirstChild +
        Math.max(0, preschoolChildren - 1) *
          TW_SPECIAL_DEDUCTIONS_2026.preschoolSecondAndLaterChild
      : 0;
  const longTermCareDeductionCandidate =
    Math.max(0, Math.floor(taxReliefs.longTermCarePersons ?? 0)) *
    TW_SPECIAL_DEDUCTIONS_2026.longTermCare;
  const rentDeductionCandidate = clampAmount(
    taxReliefs.rentPaid,
    householdMembers >= 3
      ? TW_SPECIAL_DEDUCTIONS_2026.rentExpandedHousehold
      : TW_SPECIAL_DEDUCTIONS_2026.rent,
  );

  const grossAfterGoldCardExemption =
    taxReliefs.isGoldCardHolder && grossSalary > TW_GOLD_CARD_2026.salaryThreshold
      ? grossSalary -
        (grossSalary - TW_GOLD_CARD_2026.salaryThreshold) *
          TW_GOLD_CARD_2026.exemptionRate
      : grossSalary;
  const baseDeductionsBeforeConditional =
    standardOrItemizedDeduction +
    totalExemptions +
    specialSalaryDeduction +
    disabilityDeduction +
    savingsAndInvestmentDeduction +
    collegeTuitionDeduction +
    voluntaryPensionContribution;
  const conditionalDeductionCandidate =
    preschoolChildrenDeductionCandidate +
    longTermCareDeductionCandidate +
    rentDeductionCandidate;
  const taxableIncomeWithConditional = Math.max(
    0,
    grossAfterGoldCardExemption -
      baseDeductionsBeforeConditional -
      conditionalDeductionCandidate,
  );
  const conditionalDeductionsAllowed =
    conditionalDeductionCandidate === 0 ||
    (taxableIncomeWithConditional <=
      TW_SPECIAL_DEDUCTIONS_2026.incomeTestThreshold &&
      grossSalary <= TW_SPECIAL_DEDUCTIONS_2026.basicIncomeTestThreshold);
  const preschoolChildrenDeduction = conditionalDeductionsAllowed
    ? preschoolChildrenDeductionCandidate
    : 0;
  const longTermCareDeduction = conditionalDeductionsAllowed
    ? longTermCareDeductionCandidate
    : 0;
  const rentDeduction = conditionalDeductionsAllowed
    ? rentDeductionCandidate
    : 0;
  const specialDeductionsForBasicLivingComparison =
    savingsAndInvestmentDeduction +
    disabilityDeduction +
    collegeTuitionDeduction +
    preschoolChildrenDeduction +
    longTermCareDeduction +
    rentDeduction;
  const basicLivingExpenseDifference = Math.max(
    0,
    householdMembers * TW_BASIC_LIVING_EXPENSE_2025 -
      (totalExemptions +
        standardOrItemizedDeduction +
        specialDeductionsForBasicLivingComparison),
  );

  const totalDeductionsAndExemptions =
    standardOrItemizedDeduction +
    totalExemptions +
    specialSalaryDeduction +
    disabilityDeduction +
    savingsAndInvestmentDeduction +
    collegeTuitionDeduction +
    preschoolChildrenDeduction +
    longTermCareDeduction +
    rentDeduction +
    basicLivingExpenseDifference +
    voluntaryPensionContribution;

  const taxableIncomeBeforeGoldCard = Math.max(
    0,
    grossSalary - totalDeductionsAndExemptions
  );

  const goldCardExemption =
    taxReliefs.isGoldCardHolder && grossSalary > TW_GOLD_CARD_2026.salaryThreshold
      ? (grossSalary - TW_GOLD_CARD_2026.salaryThreshold) *
        TW_GOLD_CARD_2026.exemptionRate
      : 0;
  const taxableIncome = Math.max(0, taxableIncomeBeforeGoldCard - goldCardExemption);

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
    goldCardThreshold: TW_GOLD_CARD_2026.salaryThreshold,
    isGoldCardApplied: taxReliefs.isGoldCardHolder && goldCardExemption > 0,

    // Bracket taxes based on final taxable income
    bracketTaxes: taxResult.bracketTaxes,

    // Social insurance
    socialInsurance: annualSocialInsurance,
    socialInsuranceMonthly: socialInsurance,

    // Deductions breakdown
    deductions: {
      deductionMethod: requestedDeductionMethod,
      deductionMethodApplied,
      standardDeduction,
      itemizedDeduction,
      personalExemption,
      dependentExemption,
      elderlyLinealAscendantExemption,
      specialSalaryDeduction,
      disabilityDeduction,
      savingsAndInvestmentDeduction,
      collegeTuitionDeduction,
      preschoolChildrenDeduction,
      longTermCareDeduction,
      rentDeduction,
      basicLivingExpenseDifference,
      ...itemizedDeductions,
      voluntaryPensionContribution,
      conditionalDeductionsAllowed,
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

  // Total deductions from gross. Voluntary labor pension reduces taxable income
  // and is also cash contributed by the employee, so it reduces take-home pay.
  const totalDeductions =
    totalTax + taxResult.deductions.voluntaryPensionContribution;

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
      deductionMethod: taxResult.deductions.deductionMethod,
      deductionMethodApplied: taxResult.deductions.deductionMethodApplied,
      standardDeduction: taxResult.deductions.standardDeduction,
      itemizedDeduction: taxResult.deductions.itemizedDeduction,
      personalExemption: taxResult.deductions.personalExemption,
      dependentExemption: taxResult.deductions.dependentExemption,
      elderlyLinealAscendantExemption:
        taxResult.deductions.elderlyLinealAscendantExemption,
      specialSalaryDeduction: taxResult.deductions.specialSalaryDeduction,
      disabilityDeduction: taxResult.deductions.disabilityDeduction,
      savingsAndInvestmentDeduction:
        taxResult.deductions.savingsAndInvestmentDeduction,
      collegeTuitionDeduction: taxResult.deductions.collegeTuitionDeduction,
      preschoolChildrenDeduction:
        taxResult.deductions.preschoolChildrenDeduction,
      longTermCareDeduction: taxResult.deductions.longTermCareDeduction,
      rentDeduction: taxResult.deductions.rentDeduction,
      basicLivingExpenseDifference:
        taxResult.deductions.basicLivingExpenseDifference,
      charitableDonations: taxResult.deductions.charitableDonations,
      insurancePremiums: taxResult.deductions.insurancePremiums,
      medicalAndMaternityExpenses:
        taxResult.deductions.medicalAndMaternityExpenses,
      mortgageInterest: taxResult.deductions.mortgageInterest,
      calamityLosses: taxResult.deductions.calamityLosses,
      voluntaryPensionContribution: taxResult.deductions.voluntaryPensionContribution,
      conditionalDeductionsAllowed:
        taxResult.deductions.conditionalDeductionsAllowed,
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

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const twInputs = inputs as Partial<TWCalculatorInputs> | undefined;
    const isResident = (twInputs?.taxResidency ?? "resident") === "resident";

    return {
      voluntaryPensionContribution: {
        limit: isResident
          ? TW_LABOR_PENSION_2026.monthlyWageCap *
            TW_LABOR_PENSION_2026.employeeVoluntaryMaxRate *
            12
          : 0,
        name: "Voluntary Labor Pension Contribution",
        description:
          "Employee can voluntarily contribute 0-6% of monthly salary (capped at NT$150,000)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): TWCalculatorInputs {
    return {
      country: "TW",
      grossSalary: 720_000, // NT$60,000 monthly (typical white-collar salary)
      payFrequency: "monthly",
      taxResidency: "resident",
      contributions: {
        voluntaryPensionContribution: 0,
      },
      taxReliefs: {
        isMarried: false,
        hasDisability: false,
        deductionMethod: "auto",
        numberOfDependents: 0,
        numberOfElderlyLinealAscendants: 0,
        disabledPersons: 0,
        savingsAndInvestmentIncome: 0,
        collegeTuitionChildren: 0,
        preschoolChildren: 0,
        longTermCarePersons: 0,
        rentPaid: 0,
        charitableDonations: 0,
        insurancePremiums: 0,
        medicalAndMaternityExpenses: 0,
        mortgageInterest: 0,
        calamityLosses: 0,
        isGoldCardHolder: false,
      },
    };
  },
};
