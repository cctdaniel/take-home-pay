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
  UK_PENSION_ANNUAL_ALLOWANCE,
  calculateNationalInsurance,
  calculatePersonalAllowance,
  calculatePensionTaxRelief,
  calculateProgressiveTax,
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

// ==========================================================================
// UNITED KINGDOM CALCULATOR
// ==========================================================================

export function calculateUK(inputs: UKCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    region,
    contributions,
  } = inputs;

  const isResident = residencyType === "resident";
  
  // Get raw pension contribution (if any)
  const rawPensionContribution = contributions?.pensionContribution || 0;
  
  // ==========================================================================
  // STEP 1: Calculate Personal Allowance (without pension for now)
  // ==========================================================================
  const personalAllowanceResult = calculatePersonalAllowance(
    grossSalary,
    isResident,
  );

  // ==========================================================================
  // STEP 2: Calculate Taxable Income
  // ==========================================================================
  const taxableIncome = Math.max(0, grossSalary - personalAllowanceResult.allowance);

  // ==========================================================================
  // STEP 3: Calculate Income Tax
  // ==========================================================================
  const taxBands =
    region === "scotland" ? UK_INCOME_TAX_BANDS_SCOTLAND : UK_INCOME_TAX_BANDS_RUK;
  
  const { totalTax: incomeTax, bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    taxBands,
  );

  // ==========================================================================
  // STEP 4: Calculate National Insurance
  // ==========================================================================
  const nationalInsurance = calculateNationalInsurance(grossSalary);

  // ==========================================================================
  // STEP 5: Calculate Pension Tax Relief and Net Cost
  // ==========================================================================
  // The pension contribution input represents the GROSS amount going into pension
  // Tax relief reduces the actual cost to the employee
  // Basic rate: Pay £80, get £100 in pension (20% relief)
  // Higher rate: Pay £80, get £100 in pension, claim £20 back (40% total relief)
  
  const higherRateTaxpayer = isHigherRateTaxpayer(taxableIncome);
  
  // Calculate gross pension (capped at gross salary for practical reasons)
  const grossPensionContribution = Math.min(rawPensionContribution, grossSalary);
  
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
  
  // Cap net cost to ensure non-negative take-home
  const totalTax = incomeTax + nationalInsurance.total;
  const maxAffordableNetCost = Math.max(0, grossSalary - totalTax);
  const cappedNetPensionCost = Math.min(netPensionCost, maxAffordableNetCost);
  

  // ==========================================================================
  // STEP 6: Build Tax Breakdown and Totals
  // ==========================================================================
  const taxes: UKTaxBreakdown = {
    totalIncomeTax: incomeTax,
    incomeTax,
    nationalInsurance: nationalInsurance.total,
  };

  const totalDeductions = totalTax + cappedNetPensionCost;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // ==========================================================================
  // STEP 8: Build Detailed Breakdown
  // ==========================================================================
  const breakdown: UKBreakdown = {
    type: "UK",
    region,
    isResident,
    grossIncome: grossSalary,
    personalAllowance: personalAllowanceResult.allowance,
    personalAllowanceReduction: personalAllowanceResult.reduction,
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
  };

  return {
    country: "UK",
    currency: "GBP",
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
      nationalInsurance: {
        limit: UK_NI_THRESHOLDS_2026_27.upperEarningsLimit,
        name: "Class 1 National Insurance",
        description: "Employee NI: 0% below PT, 8% to UEL, 2% above",
        preTax: false, // NI is calculated on gross, not reduced by pension
      },
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
      contributions: {
        pensionContribution: 0,
      },
    };
  },
};
