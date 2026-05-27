// ==========================================================================
// UNITED KINGDOM CALCULATOR IMPLEMENTATION
// Tax Year: 2026/27 (6 April 2026 to 5 April 2027)
//
// Official Sources:
// - HMRC Rates and Thresholds for Employers 2026/27:
//   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// - GOV.UK Income Tax Rates:
//   https://www.gov.uk/income-tax-rates
// - Scottish Income Tax:
//   https://www.gov.uk/scottish-income-tax
//
// Components:
// 1. Income Tax - progressive rates with Personal Allowance taper
// 2. National Insurance - Class 1 employee contributions
// 3. Pension Contributions - with tax relief (optional)
// ==========================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  UKBreakdown,
  UKCalculatorInputs,
  UKTaxBreakdown,
} from "../types";
import { UK_CONFIG } from "./config";
import {
  UK_INCOME_TAX_BANDS_RUK,
  UK_INCOME_TAX_BANDS_SCOTLAND,
  UK_NI_RATES_2026_27,
  UK_NI_THRESHOLDS_2026_27,
  UK_MARRIAGE_ALLOWANCE_TAX_REDUCTION,
  UK_MARRIAGE_ALLOWANCE_TRANSFERABLE_AMOUNT,
  UK_PENSION_ANNUAL_ALLOWANCE,
  calculatePostgraduateLoanRepayment,
  calculateStudentLoanRepayment,
  calculateNationalInsurance,
  calculatePersonalAllowance,
  calculatePensionTaxRelief,
  calculateProgressiveTax,
  isMarriageAllowanceRecipientEligible,
} from "./constants/tax-brackets-2026-27";

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Get number of pay periods per year based on frequency
 */
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

/**
 * Determine if taxpayer is a higher or additional rate taxpayer
 * for pension tax relief calculations
 */
function isHigherRateTaxpayer(taxableIncome: number): boolean {
  // Higher rate starts at £37,700 of taxable income
  return taxableIncome > 37700;
}

function clampAmount(value: number, max = Infinity): number {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

// ==========================================================================
// UNITED KINGDOM CALCULATOR
// ==========================================================================

export function calculateUK(inputs: UKCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    region,
    taxableBenefitsInKind = 0,
    studentLoanPlan = "none",
    hasPostgraduateLoan = false,
    marriageAllowance = "none",
    contributions,
  } = inputs;

  const isResident = residencyType === "resident";
  const cashGrossSalary = Math.max(0, grossSalary);
  const taxableBenefits = Math.max(0, taxableBenefitsInKind || 0);
  const taxableGrossIncome = cashGrossSalary + taxableBenefits;
  
  // Get raw pension contribution (if any)
  const rawPensionContribution = clampAmount(
    contributions?.pensionContribution || 0,
    UK_PENSION_ANNUAL_ALLOWANCE,
  );
  
  // ==========================================================================
  // STEP 1: Calculate Personal Allowance (without pension for now)
  // ==========================================================================
  const personalAllowanceResult = calculatePersonalAllowance(
    taxableGrossIncome,
    isResident,
  );
  const marriageAllowanceTransferredOut =
    isResident && marriageAllowance === "transferring"
      ? Math.min(
          UK_MARRIAGE_ALLOWANCE_TRANSFERABLE_AMOUNT,
          personalAllowanceResult.allowance,
        )
      : 0;
  const personalAllowance = Math.max(
    0,
    personalAllowanceResult.allowance - marriageAllowanceTransferredOut,
  );

  // ==========================================================================
  // STEP 2: Calculate Taxable Income
  // ==========================================================================
  const taxableIncome = Math.max(0, taxableGrossIncome - personalAllowance);

  // ==========================================================================
  // STEP 3: Calculate Income Tax
  // ==========================================================================
  const taxBands =
    region === "scotland" ? UK_INCOME_TAX_BANDS_SCOTLAND : UK_INCOME_TAX_BANDS_RUK;
  
  const { totalTax: incomeTaxBeforeMarriageAllowance, bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    taxBands,
  );
  const marriageAllowanceEligible =
    marriageAllowance === "receiving" &&
    isMarriageAllowanceRecipientEligible({
      taxableIncome,
      region,
      isResident,
    });
  const marriageAllowanceTaxReduction = marriageAllowanceEligible
    ? Math.min(
        incomeTaxBeforeMarriageAllowance,
        UK_MARRIAGE_ALLOWANCE_TAX_REDUCTION,
      )
    : 0;
  const incomeTax = Math.max(
    0,
    incomeTaxBeforeMarriageAllowance - marriageAllowanceTaxReduction,
  );

  // ==========================================================================
  // STEP 4: Calculate National Insurance
  // ==========================================================================
  const nationalInsurance = calculateNationalInsurance(cashGrossSalary);

  // ==========================================================================
  // STEP 5: Calculate Pension Tax Relief and Net Cost
  // ==========================================================================
  // The pension contribution input represents the GROSS amount going into pension
  // Tax relief reduces the actual cost to the employee
  // Basic rate: Pay £80, get £100 in pension (20% relief)
  // Higher rate: Pay £80, get £100 in pension, claim £20 back (40% total relief)
  
  const higherRateTaxpayer = isHigherRateTaxpayer(taxableIncome);
  
  // Calculate gross pension (capped at gross salary for practical reasons)
  const grossPensionContribution = Math.min(
    rawPensionContribution,
    cashGrossSalary,
  );
  
  // For relief at source: you pay net, HMRC adds 20% to make it gross
  // Net cost = Gross × 0.80 (for basic rate)
  // But higher rate taxpayers can claim additional 20% or 25% back via tax return
  const pensionRelief = calculatePensionTaxRelief(
    grossPensionContribution,
    taxableIncome,
    higherRateTaxpayer,
  );
  
  // Net cost to employee = Gross - total relief
  // This is what actually reduces take-home pay
  const netPensionCost = Math.max(0, grossPensionContribution - pensionRelief.totalRelief);
  const studentLoan = calculateStudentLoanRepayment(
    cashGrossSalary,
    studentLoanPlan,
  );
  const postgraduateLoan = calculatePostgraduateLoanRepayment(
    cashGrossSalary,
    hasPostgraduateLoan,
  );
  
  // Cap net cost to ensure non-negative take-home
  const statutoryBeforePension =
    incomeTax +
    nationalInsurance.total +
    studentLoan.repayment +
    postgraduateLoan.repayment;
  const maxAffordableNetCost = Math.max(0, cashGrossSalary - statutoryBeforePension);
  const cappedNetPensionCost = Math.min(netPensionCost, maxAffordableNetCost);
  

  // ==========================================================================
  // STEP 6: Build Tax Breakdown and Totals
  // ==========================================================================
  const taxes: UKTaxBreakdown = {
    totalIncomeTax: incomeTax,
    incomeTax,
    nationalInsurance: nationalInsurance.total,
    studentLoanRepayment: studentLoan.repayment,
    postgraduateLoanRepayment: postgraduateLoan.repayment,
  };

  const statutoryPayrollDeductions =
    nationalInsurance.total + studentLoan.repayment + postgraduateLoan.repayment;
  const totalTaxWithPayrollDeductions = incomeTax + statutoryPayrollDeductions;
  const totalDeductions = totalTaxWithPayrollDeductions + cappedNetPensionCost;
  const netSalary = cashGrossSalary - totalDeductions;
  const effectiveTaxRate =
    cashGrossSalary > 0 ? totalTaxWithPayrollDeductions / cashGrossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // ==========================================================================
  // STEP 8: Build Detailed Breakdown
  // ==========================================================================
  const breakdown: UKBreakdown = {
    type: "UK",
    region,
    isResident,
    grossIncome: cashGrossSalary,
    taxableBenefitsInKind: taxableBenefits,
    taxableGrossIncome,
    personalAllowance,
    personalAllowanceReduction: personalAllowanceResult.reduction,
    marriageAllowanceTransferredOut,
    marriageAllowanceTaxReduction,
    marriageAllowanceEligible,
    taxableIncome,
    bracketTaxes,
    incomeTax,
    nationalInsurance: {
      primaryThreshold: UK_NI_THRESHOLDS_2026_27.primaryThreshold,
      upperEarningsLimit: UK_NI_THRESHOLDS_2026_27.upperEarningsLimit,
      mainRate: UK_NI_RATES_2026_27.mainRate,
      additionalRate: UK_NI_RATES_2026_27.additionalRate,
      mainContribution: nationalInsurance.mainContribution,
      additionalContribution: nationalInsurance.additionalContribution,
      total: nationalInsurance.total,
    },
    pensionContribution: grossPensionContribution,
    pensionNetCost: cappedNetPensionCost,
    pensionTaxRelief: pensionRelief.totalRelief,
    studentLoan: {
      plan: studentLoanPlan,
      threshold: studentLoan.threshold,
      rate: studentLoan.rate,
      repayment: studentLoan.repayment,
    },
    postgraduateLoan,
  };

  return {
    country: "UK",
    currency: "GBP",
    grossSalary: cashGrossSalary,
    taxableIncome,
    taxes,
    totalTax: totalTaxWithPayrollDeductions,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: cashGrossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

// ==========================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ==========================================================================

export const UKCalculator: CountryCalculator = {
  countryCode: "UK",
  config: UK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "UK") {
      throw new Error("UKCalculator can only calculate UK inputs");
    }
    return calculateUK(inputs as UKCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [
      {
        code: "rest_of_uk",
        name: "England, Wales & Northern Ireland",
        taxType: "progressive",
      },
      {
        code: "scotland",
        name: "Scotland",
        taxType: "progressive",
        notes: "Scottish Income Tax applies to non-savings non-dividend income",
      },
    ];
  },

  getContributionLimits(): ContributionLimits {
    return {
      pensionContribution: {
        limit: UK_PENSION_ANNUAL_ALLOWANCE,
        name: "Pension Annual Allowance",
        description: "Maximum pension contribution with tax relief (£60,000 for 2026/27)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): UKCalculatorInputs {
    return {
      country: "UK",
      grossSalary: 35000, // £35,000 - median UK salary
      payFrequency: "monthly",
      residencyType: "resident",
      region: "rest_of_uk",
      taxableBenefitsInKind: 0,
      studentLoanPlan: "none",
      hasPostgraduateLoan: false,
      marriageAllowance: "none",
      contributions: {
        pensionContribution: 0,
      },
    };
  },
};
