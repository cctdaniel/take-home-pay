// ============================================================================
// SWITZERLAND CALCULATOR IMPLEMENTATION
// ============================================================================
// 
// This calculator implements Switzerland's three-tier tax system:
// 1. Federal Direct Tax (Direkte Bundessteuer) - uniform across Switzerland
// 2. Cantonal Tax - varies by canton (26 cantons)
// 3. Municipal Tax - varies by municipality (multiplier on cantonal tax)
//
// Social Security:
// - 1st Pillar: AHV/IV/EO (old age, disability, loss of earnings)
// - 2nd Pillar: BVG/LPP (occupational pension)
// - ALV: Unemployment insurance
// - Accident insurance (employee portion for non-occupational)
//
// Health insurance (LAMal/KVG) is mandatory but paid individually, not through
// payroll. It is included here as an informational deduction.
//
// SOURCES:
// - Federal Tax Administration (ESTV): 2025 tax tables (basis for 2026)
// - Kendris Social Insurances 2026
// - EY Social Security Overview 2026
// - BSV (Federal Social Insurance Office)
//
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { CH_CONFIG } from "./config";
import type { CHBreakdown, CHCalculatorInputs, CHTaxBreakdown } from "./types-ch";
import {
  CH_ALV_2026,
  CH_BVG_2026,
  CH_CANTONAL_PROFILES,
  CH_DEDUCTIONS_2026,
  CH_DEFAULT_CANTON,
  CH_FEDERAL_CHILD_DEDUCTION,
  CH_HEALTH_INSURANCE_2026,
  CH_PILLAR3A_2026,
  CH_SOCIAL_SECURITY_2026,
  calculateCoordinatedSalary,
  getBVGContributionRate,
  getCantonalProfile,
  getFederalTaxBrackets,
  type CHFilingStatus,
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

/**
 * Calculate progressive tax using the Swiss bracket method
 * Swiss tax tables use specific formulas per bracket
 */
function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  if (income <= 0) return 0;

  let totalTax = 0;

  for (const bracket of brackets) {
    if (income > bracket.min) {
      // Calculate the portion of income that falls within this bracket
      const bracketMax = bracket.max === Infinity ? income : bracket.max;
      const taxableInBracket = Math.min(income, bracketMax) - bracket.min;
      
      if (taxableInBracket > 0) {
        totalTax += taxableInBracket * bracket.rate;
      }
    }
  }

  // Round down to nearest 5 centimes (Swiss convention)
  return Math.floor(totalTax * 20) / 20;
}

/**
 * Calculate social security contributions (AHV/IV/EO + ALV + BVG)
 */
function calculateSocialSecurity(
  grossSalary: number,
  age: number,
  includeBVG: boolean
): {
  ahvIvEo: number;
  alv: number;
  bvg: number;
  total: number;
  ahvIvEoRate: number;
  alvRate: number;
  bvgRate: number;
  coordinatedSalary: number;
} {
  // AHV/IV/EO - no cap
  const ahvIvEo = grossSalary * CH_SOCIAL_SECURITY_2026.totalEmployeeRate;

  // ALV - capped
  const alvTaxableSalary = Math.min(grossSalary, CH_ALV_2026.cap);
  const alv = alvTaxableSalary * CH_ALV_2026.employeeRate;

  // BVG - occupational pension (if enabled)
  let bvg = 0;
  let coordinatedSalary = 0;
  const bvgContributionRate = includeBVG ? getBVGContributionRate(age) : 0;

  if (includeBVG && age >= 25 && grossSalary > CH_BVG_2026.entryThreshold) {
    coordinatedSalary = calculateCoordinatedSalary(grossSalary);
    // Employee pays at least 50% of contribution
    const totalBVGContribution = coordinatedSalary * bvgContributionRate;
    bvg = totalBVGContribution * CH_BVG_2026.employeeShare;
  }

  return {
    ahvIvEo,
    alv,
    bvg,
    total: ahvIvEo + alv + bvg,
    ahvIvEoRate: CH_SOCIAL_SECURITY_2026.totalEmployeeRate,
    alvRate: CH_ALV_2026.employeeRate,
    bvgRate: bvgContributionRate * CH_BVG_2026.employeeShare,
    coordinatedSalary,
  };
}

/**
 * Calculate federal income tax
 */
function calculateFederalTax(
  taxableIncome: number,
  filingStatus: CHFilingStatus,
  numberOfChildren: number
): number {
  const brackets = getFederalTaxBrackets(filingStatus);
  let tax = calculateProgressiveTax(taxableIncome, brackets);

  // Deduct child allowances (CHF 263 per child)
  const childDeduction = numberOfChildren * CH_FEDERAL_CHILD_DEDUCTION;
  tax = Math.max(0, tax - childDeduction);

  return tax;
}

/**
 * Calculate cantonal and municipal taxes (simplified model)
 * Uses representative multipliers based on selected canton
 */
function calculateCantonalTax(
  federalTaxableIncome: number,
  cantonCode: string,
  filingStatus: CHFilingStatus
): {
  cantonalTax: number;
  municipalTax: number;
  total: number;
  multiplier: number;
  profileName: string;
} {
  const profile = getCantonalProfile(cantonCode);
  
  if (!profile) {
    return {
      cantonalTax: 0,
      municipalTax: 0,
      total: 0,
      multiplier: 0,
      profileName: "Unknown",
    };
  }

  // Simplified model: Use federal tax calculation as base
  // Apply cantonal-specific multiplier
  const federalBrackets = getFederalTaxBrackets(filingStatus);
  const baseTax = calculateProgressiveTax(federalTaxableIncome, federalBrackets);

  // Cantonal tax is approximately the multiplier times federal tax
  // This captures the combined cantonal + municipal burden
  const totalCantonalTax = baseTax * profile.effectiveRateMultiplier;

  // Split between cantonal and municipal (approximate)
  const cantonalShare = 0.6; // ~60% cantonal, ~40% municipal
  const cantonalTax = totalCantonalTax * cantonalShare;
  const municipalTax = totalCantonalTax * (1 - cantonalShare);

  return {
    cantonalTax,
    municipalTax,
    total: totalCantonalTax,
    multiplier: profile.effectiveRateMultiplier,
    profileName: profile.name,
  };
}

/**
 * Calculate standard deductions (simplified)
 * Professional expenses, insurance premiums, etc.
 */
function calculateStandardDeductions(
  grossSalary: number,
  filingStatus: CHFilingStatus,
  numberOfChildren: number
): {
  professionalExpenses: number;
  insurancePremiums: number;
  total: number;
} {
  // Professional expenses (3% of net income, min CHF 2,000, max CHF 4,000)
  const professionalExpenses = Math.min(
    Math.max(grossSalary * CH_DEDUCTIONS_2026.professionalExpenses.percentageRate, 
              CH_DEDUCTIONS_2026.professionalExpenses.minDeduction),
    CH_DEDUCTIONS_2026.professionalExpenses.maxDeduction
  );

  // Insurance premiums (simplified approximation)
  // In practice, this depends on actual premiums paid
  let insurancePremiums = CH_HEALTH_INSURANCE_2026.maxDeductionSingle;
  if (filingStatus === "married") {
    insurancePremiums = CH_HEALTH_INSURANCE_2026.maxDeductionMarried;
  }
  insurancePremiums += numberOfChildren * CH_HEALTH_INSURANCE_2026.maxDeductionPerChild;

  return {
    professionalExpenses,
    insurancePremiums,
    total: professionalExpenses + insurancePremiums,
  };
}

// ============================================================================
// MAIN CALCULATOR
// ============================================================================

export function calculateCH(inputs: CHCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    filingStatus,
    canton,
    age,
    numberOfChildren,
    contributions,
    includeHealthInsurance,
  } = inputs;

  // Calculate standard deductions
  const standardDeductions = calculateStandardDeductions(
    grossSalary,
    filingStatus,
    numberOfChildren
  );

  // Pillar 3a deduction
  const pillar3aContribution = Math.min(
    contributions.pillar3aContribution,
    CH_PILLAR3A_2026.maxContributionWithPension
  );

  // Calculate taxable income (federal)
  // Note: This is simplified; actual Swiss tax calculation has many specific rules
  const totalDeductions = standardDeductions.total + pillar3aContribution;
  const federalTaxableIncome = Math.max(0, grossSalary - totalDeductions);

  // Calculate taxes
  const federalTax = calculateFederalTax(
    federalTaxableIncome,
    filingStatus,
    numberOfChildren
  );

  const cantonalResult = calculateCantonalTax(
    federalTaxableIncome,
    canton,
    filingStatus
  );

  // Calculate social security
  const socialSecurity = calculateSocialSecurity(
    grossSalary,
    age,
    contributions.includeBVG
  );

  // Calculate health insurance (informational, not a tax)
  let healthInsuranceCost = 0;
  if (includeHealthInsurance) {
    healthInsuranceCost = CH_HEALTH_INSURANCE_2026.averageMonthlyPremium * 12;
  }

  // Total taxes (federal + cantonal/municipal)
  const totalIncomeTax = federalTax + cantonalResult.total;

  // Total deductions from salary (taxes + mandatory social security)
  // Note: Health insurance is paid separately, not deducted from salary
  const totalDeductionsFromSalary = totalIncomeTax + socialSecurity.total;

  // Net salary
  const netSalary = grossSalary - totalDeductionsFromSalary;

  // Effective tax rate
  const effectiveTaxRate = grossSalary > 0 ? totalIncomeTax / grossSalary : 0;

  // Per-period calculations
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Build tax breakdown
  const taxes: CHTaxBreakdown = {
    totalIncomeTax,
    federalIncomeTax: federalTax,
    cantonalIncomeTax: cantonalResult.cantonalTax,
    municipalIncomeTax: cantonalResult.municipalTax,
    ahvIvEo: socialSecurity.ahvIvEo,
    alv: socialSecurity.alv,
    bvg: socialSecurity.bvg,
    healthInsurance: includeHealthInsurance ? healthInsuranceCost : 0,
  };

  // Build detailed breakdown
  const breakdown: CHBreakdown = {
    type: "CH",
    filingStatus,
    canton,
    cantonName: cantonalResult.profileName,
    
    // Taxable income
    federalTaxableIncome,
    
    // Tax breakdown
    federalTax,
    cantonalTax: cantonalResult.cantonalTax,
    municipalTax: cantonalResult.municipalTax,
    totalCantonalTax: cantonalResult.total,
    cantonalMultiplier: cantonalResult.multiplier,
    
    // Social security
    socialSecurity: {
      ahvIvEo: socialSecurity.ahvIvEo,
      ahvIvEoRate: socialSecurity.ahvIvEoRate,
      alv: socialSecurity.alv,
      alvRate: socialSecurity.alvRate,
      alvCap: CH_ALV_2026.cap,
      bvg: socialSecurity.bvg,
      bvgRate: socialSecurity.bvgRate,
      coordinatedSalary: socialSecurity.coordinatedSalary,
      totalSocialSecurity: socialSecurity.total,
    },
    
    // Deductions
    deductions: {
      professionalExpenses: standardDeductions.professionalExpenses,
      insurancePremiums: standardDeductions.insurancePremiums,
      pillar3a: pillar3aContribution,
      totalDeductions,
    },
    
    // Health insurance (informational)
    healthInsurance: {
      annualCost: healthInsuranceCost,
      monthlyCost: includeHealthInsurance ? CH_HEALTH_INSURANCE_2026.averageMonthlyPremium : 0,
      isIncluded: includeHealthInsurance,
    },
    
    // Pillar 3a
    pillar3a: {
      contribution: pillar3aContribution,
      maxContribution: CH_PILLAR3A_2026.maxContributionWithPension,
    },
    
    // Tax credits/allowances
    childAllowances: numberOfChildren * CH_FEDERAL_CHILD_DEDUCTION,
    numberOfChildren,
    
    // Rates
    effectiveTaxRate,
    effectiveSocialSecurityRate: grossSalary > 0 ? socialSecurity.total / grossSalary : 0,
    totalDeductionRate: grossSalary > 0 ? totalDeductionsFromSalary / grossSalary : 0,
  };

  return {
    country: "CH",
    currency: "CHF",
    grossSalary,
    taxableIncome: federalTaxableIncome,
    taxes,
    totalTax: totalIncomeTax,
    totalDeductions: totalDeductionsFromSalary,
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

export const CHCalculator: CountryCalculator = {
  countryCode: "CH",
  config: CH_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CH") {
      throw new Error("CHCalculator can only calculate CH inputs");
    }
    return calculateCH(inputs as CHCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return CH_CANTONAL_PROFILES.map((canton) => ({
      code: canton.code,
      name: canton.name,
      taxType: "progressive",
      notes: canton.description,
    }));
  },

  getContributionLimits(): ContributionLimits {
    return {
      pillar3a: {
        limit: CH_PILLAR3A_2026.maxContributionWithPension,
        name: "Pillar 3a",
        description: "Maximum annual contribution to tied pension provision (Pillar 3a)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CHCalculatorInputs {
    return {
      country: "CH",
      grossSalary: 90000,
      payFrequency: "monthly",
      filingStatus: "single",
      canton: CH_DEFAULT_CANTON,
      age: 35,
      numberOfChildren: 0,
      contributions: {
        pillar3aContribution: 0,
        includeBVG: true,
      },
      includeHealthInsurance: true,
    };
  },
};
