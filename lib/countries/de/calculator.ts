// ============================================================================
// GERMANY CALCULATOR IMPLEMENTATION
// Tax Year: 2026
// ============================================================================
//
// Implements the full German tax system including:
// - Income Tax (Einkommensteuer) per §32a EStG with formula-based calculation
// - Solidarity Surcharge (Solidaritätszuschlag) with exemption thresholds
// - Social Security Contributions (Sozialversicherung):
//   * Pension Insurance (Rentenversicherung)
//   * Health Insurance (Krankenversicherung)
//   * Unemployment Insurance (Arbeitslosenversicherung)
//   * Long-term Care Insurance (Pflegeversicherung)
// - Church Tax (Kirchensteuer) - optional, varies by state
//
// OFFICIAL SOURCES:
// - German Income Tax Law (EStG) §32a: https://www.buzer.de/32a_EStG.htm
// - Federal Ministry of Finance: https://www.bundesfinanzministerium.de/
// - Social Security Ceilings 2026: https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514
// - Solidarity Surcharge: https://www.finanztip.de/solidaritaetszuschlag/
// - Church Tax: https://allaboutberlin.com/glossary/Kirchensteuer
//
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  DEBreakdown,
  DECalculatorInputs,
  DETaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { DE_CONFIG } from "./config";
import {
  calculateGermanIncomeTax,
  calculateSocialSecurity,
  calculateSolidaritySurcharge,
} from "./constants/tax-brackets-2026";
import { DE_FEDERAL_STATES } from "./config";

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
 * Get church tax rate for a given state
 * @param stateCode - Two-letter state code
 * @returns Church tax rate (0.08 or 0.09)
 */
function getChurchTaxRate(stateCode: string): number {
  const state = DE_FEDERAL_STATES.find((s) => s.code === stateCode);
  return state?.churchTaxRate ?? 0.09; // Default to 9% if state not found
}

// ============================================================================
// GERMANY CALCULATOR
// ============================================================================
export function calculateDE(inputs: DECalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    state,
    isMarried,
    isChurchMember,
    isChildless,
  } = inputs;

  // Step 1: Calculate Social Security Contributions
  // These are deducted from gross salary before income tax calculation
  const socialSecurity = calculateSocialSecurity(grossSalary, isChildless ?? false);

  // Step 2: Calculate Taxable Income
  // In Germany, social security contributions reduce taxable income
  // However, the German system is complex: some contributions reduce taxable income,
  // while income tax is calculated on the gross and then adjusted
  // For simplicity and accuracy with German payroll systems, we follow:
  // - Social security is deducted from net
  // - Taxable income is generally gross minus some deductions (like employee lump-sum)
  // But the German Lohnsteuer is calculated on gross income directly

  // Employee lump-sum deduction (Arbeitnehmer-Pauschbetrag) - €1,230/year
  // This is a standard deduction for work-related expenses
  const employeeLumpSum = 1230;

  // Special expenses lump-sum (Sonderausgaben-Pauschbetrag) - €36/year (single), €72 (married)
  const specialExpensesLumpSum = isMarried ? 72 : 36;

  // Total standard deductions
  const standardDeductions = employeeLumpSum + specialExpensesLumpSum;

  // Taxable income calculation
  // Note: In Germany, social security contributions don't directly reduce taxable income
  // but there is a tax credit for them. For simplicity in this calculator,
  // we calculate income tax on (gross - standard deductions) and keep SS separate
  const taxableIncome = Math.max(0, grossSalary - standardDeductions);

  // Step 3: Calculate Income Tax (Einkommensteuer)
  const incomeTax = calculateGermanIncomeTax(taxableIncome);

  // Step 4: Calculate Solidarity Surcharge (Solidaritätszuschlag)
  // 5.5% of income tax, with exemption thresholds
  const solidaritySurcharge = calculateSolidaritySurcharge(incomeTax, isMarried ?? false);

  // Step 5: Calculate Church Tax (Kirchensteuer)
  // Only if member of a recognized religious community
  const stateCode = state || "BE"; // Default to Berlin if not specified
  const churchTaxRate = getChurchTaxRate(stateCode);
  const churchTax = isChurchMember
    ? Math.round(incomeTax * churchTaxRate)
    : 0;

  // Step 6: Calculate Total Tax
  // Total income tax burden includes: income tax + solidarity + church tax
  const totalIncomeTax = incomeTax + solidaritySurcharge + churchTax;

  // Step 7: Calculate Total Deductions and Net Salary
  // Total deductions = income tax + solidarity + church tax + social security
  const totalDeductions = totalIncomeTax + socialSecurity.total;
  const netSalary = grossSalary - totalDeductions;

  // Effective tax rate (including all taxes and social security)
  const effectiveTaxRate = grossSalary > 0 ? totalDeductions / grossSalary : 0;

  // Period calculations
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Step 8: Build Tax Breakdown
  const taxes: DETaxBreakdown = {
    type: "DE",
    totalIncomeTax,
    incomeTax,
    solidaritySurcharge,
    churchTax,
    pensionInsurance: socialSecurity.pension,
    unemploymentInsurance: socialSecurity.unemployment,
    healthInsurance: socialSecurity.health,
    longTermCareInsurance: socialSecurity.longTermCare,
    totalSocialSecurity: socialSecurity.total,
  };

  // Step 9: Build Detailed Breakdown
  const breakdown: DEBreakdown = {
    type: "DE",
    taxableIncome,
    standardDeductions: {
      employeeLumpSum,
      specialExpensesLumpSum,
      total: standardDeductions,
    },
    taxDetails: {
      incomeTax,
      solidaritySurcharge,
      churchTax,
      totalIncomeTax,
    },
    socialSecurity: socialSecurity.details,
    totalSocialSecurity: socialSecurity.total,
    taxRates: {
      effectiveIncomeTaxRate: grossSalary > 0 ? incomeTax / grossSalary : 0,
      effectiveSolidarityRate: grossSalary > 0 ? solidaritySurcharge / grossSalary : 0,
      effectiveChurchTaxRate: grossSalary > 0 ? churchTax / grossSalary : 0,
      effectiveSocialSecurityRate: grossSalary > 0 ? socialSecurity.total / grossSalary : 0,
    },
    personalInfo: {
      isMarried: isMarried ?? false,
      isChurchMember: isChurchMember ?? false,
      isChildless: isChildless ?? false,
      state: stateCode,
      churchTaxRate: isChurchMember ? churchTaxRate : 0,
    },
  };

  return {
    country: "DE",
    currency: "EUR",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax: totalIncomeTax,
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
export const DECalculator: CountryCalculator = {
  countryCode: "DE",
  config: DE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "DE") {
      throw new Error("DECalculator can only calculate DE inputs");
    }
    return calculateDE(inputs as DECalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return DE_FEDERAL_STATES.map((state) => ({
      code: state.code,
      name: state.name,
      taxType: "none", // States don't have different income tax, only church tax
      notes: `Church tax: ${(state.churchTaxRate * 100).toFixed(0)}%`,
    }));
  },

  getContributionLimits(): ContributionLimits {
    // Germany has mandatory social security, no voluntary contribution limits
    // Church membership is a personal choice, not a contribution limit
    return {};
  },

  getDefaultInputs(): DECalculatorInputs {
    return {
      country: "DE",
      grossSalary: 55000, // €55,000 - around median income in Germany
      payFrequency: "monthly",
      state: "BE", // Berlin (default)
      isMarried: false,
      isChurchMember: false,
      isChildless: false,
    };
  },
};
