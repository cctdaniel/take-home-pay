// ============================================================================
// HONG KONG CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  ContributionLimits,
  HKBreakdown,
  HKCalculatorInputs,
  HKTaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { HK_CONFIG } from "./config";
import {
  HK_ALLOWANCES_2026,
  HK_DEDUCTIONS_2026,
  HK_MPF_2026,
  HK_STANDARD_RATE_2026,
  HK_TAX_BRACKETS_2026,
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

function calculateProgressiveTax(taxableIncome: number): number {
  let tax = 0;
  for (const bracket of HK_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.min) continue;
    const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableAtBracket * bracket.rate;
  }
  return tax;
}

// ============================================================================
// HONG KONG TAX CALCULATION
// ============================================================================
function calculateHKIncomeTax(inputs: HKCalculatorInputs) {
  const { grossSalary, residencyType, contributions, taxReliefs } = inputs;

  const monthlyIncome = grossSalary / 12;
  const monthlyRelevantIncome =
    monthlyIncome >= HK_MPF_2026.minRelevantIncomeMonthly
      ? Math.min(monthlyIncome, HK_MPF_2026.maxRelevantIncomeMonthly)
      : 0;
  const mandatoryMpf =
    monthlyRelevantIncome > 0 ? monthlyRelevantIncome * HK_MPF_2026.rate * 12 : 0;

  const voluntaryMpfAnnuity = Math.min(
    contributions.taxDeductibleVoluntaryContributions,
    HK_DEDUCTIONS_2026.voluntaryMpfAnnuityMax,
  );
  const selfEducation = Math.min(
    taxReliefs.selfEducationExpenses,
    HK_DEDUCTIONS_2026.selfEducationMax,
  );
  const homeLoanInterest = Math.min(
    taxReliefs.homeLoanInterest,
    HK_DEDUCTIONS_2026.homeLoanInterestMax,
  );
  const domesticRent = Math.min(
    taxReliefs.domesticRent,
    HK_DEDUCTIONS_2026.domesticRentMax,
  );
  const elderlyResidentialCare = Math.min(
    taxReliefs.elderlyResidentialCareExpenses,
    HK_DEDUCTIONS_2026.elderlyResidentialCareMax,
  );

  const deductionsBeforeDonations =
    mandatoryMpf +
    voluntaryMpfAnnuity +
    selfEducation +
    homeLoanInterest +
    domesticRent +
    elderlyResidentialCare;

  const donationCap =
    Math.max(grossSalary - deductionsBeforeDonations, 0) *
    HK_DEDUCTIONS_2026.donationsMaxRate;
  const charitableDonations = Math.min(
    taxReliefs.charitableDonations,
    donationCap,
  );

  const totalDeductions = deductionsBeforeDonations + charitableDonations;
  const netIncome = Math.max(0, grossSalary - totalDeductions);

  const basicAllowance = taxReliefs.hasMarriedAllowance
    ? 0
    : HK_ALLOWANCES_2026.basic;
  const marriedAllowance = taxReliefs.hasMarriedAllowance
    ? HK_ALLOWANCES_2026.married
    : 0;
  const singleParentAllowance = taxReliefs.hasSingleParentAllowance
    ? HK_ALLOWANCES_2026.singleParent
    : 0;
  const childCount = Math.max(taxReliefs.numberOfChildren, 0);
  const newbornCount = Math.min(
    Math.max(taxReliefs.numberOfNewbornChildren, 0),
    childCount,
  );
  const dependentParents = Math.max(taxReliefs.numberOfDependentParents, 0);
  const dependentParentsLivingWith = Math.min(
    Math.max(taxReliefs.numberOfDependentParentsLivingWith, 0),
    dependentParents,
  );
  const dependentSiblings = Math.max(taxReliefs.numberOfDependentSiblings, 0);
  const disabledDependents = Math.max(taxReliefs.numberOfDisabledDependents, 0);

  const allowances = residencyType === "resident"
    ? {
        basic: basicAllowance,
        married: marriedAllowance,
        singleParent: singleParentAllowance,
        child: childCount * HK_ALLOWANCES_2026.child,
        newbornChild: newbornCount * HK_ALLOWANCES_2026.newbornChild,
        dependentParent: dependentParents * HK_ALLOWANCES_2026.dependentParent,
        dependentParentLivingWith:
          dependentParentsLivingWith * HK_ALLOWANCES_2026.dependentParentLivingWith,
        dependentSibling:
          dependentSiblings * HK_ALLOWANCES_2026.dependentSibling,
        disability: taxReliefs.hasDisabilityAllowance
          ? HK_ALLOWANCES_2026.disability
          : 0,
        disabledDependent:
          disabledDependents * HK_ALLOWANCES_2026.disabledDependent,
      }
    : {
        basic: 0,
        married: 0,
        singleParent: 0,
        child: 0,
        newbornChild: 0,
        dependentParent: 0,
        dependentParentLivingWith: 0,
        dependentSibling: 0,
        disability: 0,
        disabledDependent: 0,
      };

  const totalAllowances = Object.values(allowances).reduce(
    (sum, value) => sum + value,
    0,
  );
  const netChargeableIncome = Math.max(0, netIncome - totalAllowances);

  const progressiveTax = calculateProgressiveTax(netChargeableIncome);
  const standardTax =
    netIncome <= HK_STANDARD_RATE_2026.threshold
      ? netIncome * HK_STANDARD_RATE_2026.standardRate
      : HK_STANDARD_RATE_2026.threshold * HK_STANDARD_RATE_2026.standardRate +
        (netIncome - HK_STANDARD_RATE_2026.threshold) *
          HK_STANDARD_RATE_2026.higherRate;

  const incomeTax = Math.min(progressiveTax, standardTax);

  return {
    assessableIncome: grossSalary,
    netIncome,
    netChargeableIncome,
    incomeTax,
    progressiveTax,
    standardTax,
    mandatoryMpf,
    monthlyRelevantIncome,
    deductions: {
      mandatoryMpf,
      voluntaryMpfAnnuity,
      selfEducation,
      homeLoanInterest,
      domesticRent,
      elderlyResidentialCare,
      charitableDonations,
      totalDeductions,
    },
    allowances: {
      ...allowances,
      totalAllowances,
    },
  };
}

// ============================================================================
// HONG KONG CALCULATOR
// ============================================================================
export function calculateHK(inputs: HKCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, contributions } = inputs;

  const taxResult = calculateHKIncomeTax(inputs);

  const taxes: HKTaxBreakdown = {
    totalIncomeTax: taxResult.incomeTax,
    incomeTax: taxResult.incomeTax,
    mpfEmployee: taxResult.mandatoryMpf,
  };

  const totalTax = taxes.incomeTax + taxes.mpfEmployee;
  const voluntaryContributions =
    taxResult.deductions.voluntaryMpfAnnuity;
  const totalDeductions = totalTax + voluntaryContributions;

  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: HKBreakdown = {
    type: "HK",
    assessableIncome: taxResult.assessableIncome,
    netIncome: taxResult.netIncome,
    netChargeableIncome: taxResult.netChargeableIncome,
    isResident: residencyType === "resident",
    mpf: {
      employeeContribution: taxResult.mandatoryMpf,
      rate: HK_MPF_2026.rate,
      minRelevantIncomeMonthly: HK_MPF_2026.minRelevantIncomeMonthly,
      maxRelevantIncomeMonthly: HK_MPF_2026.maxRelevantIncomeMonthly,
      monthlyRelevantIncome: taxResult.monthlyRelevantIncome,
      monthlyCap: HK_MPF_2026.employeeMonthlyCap,
    },
    deductions: taxResult.deductions,
    allowances: taxResult.allowances,
    taxComparison: {
      progressiveTax: taxResult.progressiveTax,
      standardTax: taxResult.standardTax,
      standardRateThreshold: HK_STANDARD_RATE_2026.threshold,
      standardRate: HK_STANDARD_RATE_2026.standardRate,
      higherStandardRate: HK_STANDARD_RATE_2026.higherRate,
    },
    voluntaryContributions: {
      taxDeductibleVoluntaryContributions: voluntaryContributions,
    },
  };

  return {
    country: "HK",
    currency: "HKD",
    grossSalary,
    taxableIncome: taxResult.netChargeableIncome,
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
export const HKCalculator: CountryCalculator = {
  countryCode: "HK",
  config: HK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "HK") {
      throw new Error("HKCalculator can only calculate HK inputs");
    }
    return calculateHK(inputs as HKCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      taxDeductibleVoluntaryContributions: {
        limit: HK_DEDUCTIONS_2026.voluntaryMpfAnnuityMax,
        name: "MPF TVC + QDAP",
        description: "Tax-deductible voluntary MPF/annuity contributions",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): HKCalculatorInputs {
    return {
      country: "HK",
      grossSalary: 420000, // HK$35k monthly
      payFrequency: "monthly",
      residencyType: "resident",
      contributions: {
        taxDeductibleVoluntaryContributions: 0,
      },
      taxReliefs: {
        hasMarriedAllowance: false,
        hasSingleParentAllowance: false,
        numberOfChildren: 0,
        numberOfNewbornChildren: 0,
        numberOfDependentParents: 0,
        numberOfDependentParentsLivingWith: 0,
        numberOfDependentSiblings: 0,
        hasDisabilityAllowance: false,
        numberOfDisabledDependents: 0,
        selfEducationExpenses: 0,
        homeLoanInterest: 0,
        domesticRent: 0,
        charitableDonations: 0,
        elderlyResidentialCareExpenses: 0,
      },
    };
  },
};
