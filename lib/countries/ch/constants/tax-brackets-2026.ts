// ============================================================================
// SWITZERLAND TAX BRACKETS AND SOCIAL SECURITY RATES (2026)
// ============================================================================
// 
// IMPORTANT: The official 2026 Federal Direct Tax tables have not been
// published by ESTV as of February 2026. The following uses 2025 tax tables
// as the basis for 2026 calculations. Swiss federal tax rates are typically
// indexed annually for inflation.
//
// SOURCES:
// - Federal Tax Administration (ESTV): https://www.estv.admin.ch
//   2025 Tax Tables: https://www.estv.admin.ch/dam/de/sd-web/dbst-tarife-58c-2025-de.pdf
// - Kendris Social Insurances 2026: https://www.kendris.com/en/news-insights/2026/01/08/social-insurances-contributions-and-benefits-2026/
// - EY Social Security Overview 2026: https://www.ey.com/content/dam/ey-unified-site/ey-com/en-ch/technical/tax-alerts/ey-overview-of-social-rates-final.pdf
// - Federal Social Insurance Office (BSV): https://www.bsv.admin.ch
// - AHV/IV Information Portal: https://www.ahv-iv.ch
//
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// FEDERAL DIRECT TAX (Direkte Bundessteuer) - 2026
// Based on 2025 tables with inflation adjustments expected
// ============================================================================

// Single taxpayers (Grundtarif)
// Source: ESTV 2025 tax tables (dbst-tarife-58c-2025-de.pdf)
export const CH_FEDERAL_TAX_BRACKETS_SINGLE: TaxBracket[] = [
  { min: 0, max: 18500, rate: 0 }, // Tax-free threshold
  { min: 18500, max: 33200, rate: 0.0077 }, // 0.77%
  { min: 33200, max: 43500, rate: 0.0088 }, // 0.88%
  { min: 43500, max: 58000, rate: 0.0264 }, // 2.64%
  { min: 58000, max: 76100, rate: 0.0297 }, // 2.97%
  { min: 76100, max: 82000, rate: 0.0594 }, // 5.94%
  { min: 82000, max: 108800, rate: 0.066 }, // 6.6%
  { min: 108800, max: 141500, rate: 0.088 }, // 8.8%
  { min: 141500, max: 184900, rate: 0.11 }, // 11%
  { min: 184900, max: 793400, rate: 0.132 }, // 13.2%
  { min: 793400, max: Infinity, rate: 0.115 }, // 11.5% (maximum rate)
];

// Married taxpayers and single with minor children (Verheiratetentarif)
// Source: ESTV 2025 tax tables (dbst-tarife-58c-2025-de.pdf)
export const CH_FEDERAL_TAX_BRACKETS_MARRIED: TaxBracket[] = [
  { min: 0, max: 32000, rate: 0 }, // Tax-free threshold
  { min: 32000, max: 53400, rate: 0.01 }, // 1%
  { min: 53400, max: 61300, rate: 0.02 }, // 2%
  { min: 61300, max: 79100, rate: 0.03 }, // 3%
  { min: 79100, max: 94900, rate: 0.04 }, // 4%
  { min: 94900, max: 108600, rate: 0.05 }, // 5%
  { min: 108600, max: 120500, rate: 0.06 }, // 6%
  { min: 120500, max: 130500, rate: 0.07 }, // 7%
  { min: 130500, max: 138300, rate: 0.08 }, // 8%
  { min: 138300, max: 144200, rate: 0.09 }, // 9%
  { min: 144200, max: 148200, rate: 0.10 }, // 10%
  { min: 148200, max: 150300, rate: 0.11 }, // 11%
  { min: 150300, max: 152300, rate: 0.12 }, // 12%
  { min: 152300, max: 940800, rate: 0.13 }, // 13%
  { min: 940800, max: Infinity, rate: 0.115 }, // 11.5% (maximum rate)
];

// Child deduction for federal tax (per child)
// Source: ESTV tax tables - CHF 263 per child
export const CH_FEDERAL_CHILD_DEDUCTION = 263;

// ============================================================================
// CANTONAL AND MUNICIPAL TAXES (Simplified Representative Model)
// ============================================================================
// Switzerland has 26 cantons with different tax systems. Municipal taxes
// are calculated as multipliers on cantonal taxes. For practical purposes,
// we use representative scenarios:
//
// - Zurich (ZH): Representative high-tax urban area (~40% max total)
// - Zug (ZG): Representative low-tax canton (~22% max total)
// - Geneva (GE): Representative very high-tax canton (~45% max total)
//
// Source: PwC Switzerland Tax Facts, KPMG Swiss Tax Report
// ============================================================================

export interface CantonalTaxProfile {
  code: string;
  name: string;
  nameDe: string;
  // Multiplier applied to federal taxable income for cantonal tax estimate
  // These are approximate effective rates based on typical municipal multipliers
  effectiveRateMultiplier: number;
  description: string;
}

// Representative cantonal profiles
// These multipliers approximate the total cantonal + municipal burden
// relative to the federal tax calculation methodology
export const CH_CANTONAL_PROFILES: CantonalTaxProfile[] = [
  {
    code: "ZH",
    name: "Zurich",
    nameDe: "Zürich",
    effectiveRateMultiplier: 2.8, // ~2.8x federal tax for cantonal + municipal
    description: "Urban, higher tax (City of Zurich)",
  },
  {
    code: "ZG",
    name: "Zug",
    nameDe: "Zug",
    effectiveRateMultiplier: 1.5, // ~1.5x federal tax
    description: "Low-tax business canton",
  },
  {
    code: "GE",
    name: "Geneva",
    nameDe: "Genf",
    effectiveRateMultiplier: 3.2, // ~3.2x federal tax
    description: "Very high-tax urban area",
  },
  {
    code: "VD",
    name: "Vaud",
    nameDe: "Waadt",
    effectiveRateMultiplier: 2.9, // ~2.9x federal tax
    description: "High-tax French-speaking canton",
  },
  {
    code: "BS",
    name: "Basel-City",
    nameDe: "Basel-Stadt",
    effectiveRateMultiplier: 2.6, // ~2.6x federal tax
    description: "Urban, moderate-high tax",
  },
  {
    code: "BE",
    name: "Bern",
    nameDe: "Bern",
    effectiveRateMultiplier: 2.4, // ~2.4x federal tax
    description: "Capital canton, moderate tax",
  },
  {
    code: "TI",
    name: "Ticino",
    nameDe: "Tessin",
    effectiveRateMultiplier: 2.7, // ~2.7x federal tax
    description: "Italian-speaking, higher tax",
  },
  {
    code: "NW",
    name: "Nidwalden",
    nameDe: "Nidwalden",
    effectiveRateMultiplier: 1.6, // ~1.6x federal tax
    description: "Low-tax central Swiss canton",
  },
];

// Default canton (Zurich)
export const CH_DEFAULT_CANTON = "ZH";

// ============================================================================
// SOCIAL SECURITY CONTRIBUTIONS (1st and 2nd Pillars)
// Source: Kendris 2026, EY Social Security Overview 2026, BSV
// ============================================================================

// AHV/IV/EO (1st Pillar) - Old Age, Disability, Loss of Earnings
// Source: https://www.kendris.com/en/news-insights/2026/01/08/social-insurances-contributions-and-benefits-2026/
export const CH_SOCIAL_SECURITY_2026 = {
  ahv: {
    rate: 0.087, // 8.7% total (4.35% employee, 4.35% employer)
    employeeRate: 0.0435,
    name: "AHV (Old Age Insurance)",
    nameDe: "AHV (Alters- und Hinterlassenenversicherung)",
  },
  iv: {
    rate: 0.014, // 1.4% total (0.7% employee, 0.7% employer)
    employeeRate: 0.007,
    name: "IV (Disability Insurance)",
    nameDe: "IV (Invalidenversicherung)",
  },
  eo: {
    rate: 0.005, // 0.5% total (0.25% employee, 0.25% employer)
    employeeRate: 0.0025,
    name: "EO (Loss of Earnings)",
    nameDe: "EO (Erwerbsersatzordnung)",
  },
  // Total AHV/IV/EO: 10.6% (5.3% employee)
  totalEmployeeRate: 0.053,
  totalRate: 0.106,
  // No income cap for AHV/IV/EO
};

// ALV (Unemployment Insurance)
// Source: EY Social Security Overview 2026
export const CH_ALV_2026 = {
  rate: 0.022, // 2.2% total (1.1% employee, 1.1% employer)
  employeeRate: 0.011,
  cap: 148200, // CHF 148,200 annual cap (CHF 12,350/month)
  // Solidarity contribution for high earners (above CHF 148,200 up to CHF 592,800)
  // Not included in basic calculation as it varies
  name: "ALV (Unemployment Insurance)",
  nameDe: "ALV (Arbeitslosenversicherung)",
};

// BVG/LPP (2nd Pillar - Occupational Pension)
// Source: https://www.kendris.com/en/news-insights/2026/01/08/social-insurances-contributions-and-benefits-2026/
// Source: https://www.bsv.admin.ch/en/old-age-provision-occupational-benefits-plan
export const CH_BVG_2026 = {
  entryThreshold: 22680, // CHF 22,680 annual income to be covered
  upperThreshold: 90720, // CHF 90,720 upper BVG threshold
  coordinationDeduction: 26460, // CHF 26,460 coordination deduction
  maxInsuredSalary: 64260, // CHF 64,260 maximum insured salary (90720 - 26460)
  minInterestRate: 0.0125, // 1.25% minimum interest rate
  
  // Minimum contribution rates by age group (total employee + employer)
  // Source: BVG Art. 108
  contributionRates: {
    age25to34: 0.07, // 7% (3.5% employee minimum)
    age35to44: 0.10, // 10% (5% employee minimum)
    age45to54: 0.15, // 15% (7.5% employee minimum)
    age55to65: 0.18, // 18% (9% employee minimum)
  },
  
  // Employer must pay at least 50%, typically pays more
  // We use 50% employee / 50% employer as the minimum legal split
  employeeShare: 0.5,
  employerShare: 0.5,
  
  name: "BVG/LPP (Occupational Pension)",
  nameDe: "BVG/LPP (Berufliche Vorsorge)",
};

// Get BVG contribution rate based on age
export function getBVGContributionRate(age: number): number {
  if (age < 25) return 0; // No retirement savings contribution until 25
  if (age <= 34) return CH_BVG_2026.contributionRates.age25to34;
  if (age <= 44) return CH_BVG_2026.contributionRates.age35to44;
  if (age <= 54) return CH_BVG_2026.contributionRates.age45to54;
  return CH_BVG_2026.contributionRates.age55to65;
}

// ============================================================================
// ACCIDENT INSURANCE (UVG)
// Source: EY Social Security Overview 2026
// ============================================================================

export const CH_ACCIDENT_INSURANCE_2026 = {
  // Occupational accident - employer pays
  occupationalEmployerRate: 0.017, // ~1.7% typical
  
  // Non-occupational accident - employee pays (if working > 8 hours/week)
  nonOccupationalEmployeeRate: 0.014, // ~1.4% typical
  cap: 148200, // Same cap as ALV
  
  name: "UVG (Accident Insurance)",
  nameDe: "UVG (Unfallversicherung)",
};

// ============================================================================
// HEALTH INSURANCE (LAMal/KVG)
// Source: Federal Office of Public Health (FOPH)
// ============================================================================

export const CH_HEALTH_INSURANCE_2026 = {
  // Mandatory health insurance - paid entirely by employee
  // Average premium for adult (26+), standard deductible (CHF 300)
  averageMonthlyPremium: 393, // CHF 393/month average across Switzerland
  
  // Deductible options (annual)
  minDeductible: 300,
  maxDeductible: 2500,
  
  // Tax deduction limits (federal)
  maxDeductionSingle: 1800,
  maxDeductionMarried: 3600,
  maxDeductionPerChild: 700,
  
  name: "Health Insurance (LAMal)",
  nameDe: "Krankenversicherung (KVG)",
};

// ============================================================================
// PILLAR 3a (Voluntary Pension)
// Source: Kendris 2026
// ============================================================================

export const CH_PILLAR3A_2026 = {
  // Maximum contribution for employed persons with 2nd pillar
  maxContributionWithPension: 7258, // CHF 7,258 for 2026 (unchanged from 2025)
  
  // Maximum for self-employed without 2nd pillar (20% of net income, max CHF 36,288)
  maxContributionSelfEmployed: 36288,
  selfEmployedRate: 0.20,
  
  name: "Pillar 3a",
  nameDe: "Säule 3a",
};

// ============================================================================
// STANDARD DEDUCTIONS
// ============================================================================

export const CH_DEDUCTIONS_2026 = {
  // Professional expense deductions (typical values)
  professionalExpenses: {
    // Minimum deduction
    minDeduction: 2000,
    // Percentage of net income
    percentageRate: 0.03,
    // Maximum deduction
    maxDeduction: 4000,
  },
  
  // Commuting (public transport or car)
  commutingMax: 3000, // Federal max for car
  
  // Meal expenses
  mealExpensesNoCanteen: 3200,
  mealExpensesWithCanteen: 1600,
  
  // Childcare costs (max deduction)
  childcareMax: 25500,
};

// ============================================================================
// FILING STATUS TYPES
// ============================================================================

export type CHFilingStatus = "single" | "married" | "single_parent";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get federal tax brackets based on filing status
 */
export function getFederalTaxBrackets(filingStatus: CHFilingStatus): TaxBracket[] {
  if (filingStatus === "single") {
    return CH_FEDERAL_TAX_BRACKETS_SINGLE;
  }
  // Married and single parent use the same brackets
  return CH_FEDERAL_TAX_BRACKETS_MARRIED;
}

/**
 * Get cantonal profile by code
 */
export function getCantonalProfile(code: string): CantonalTaxProfile | undefined {
  return CH_CANTONAL_PROFILES.find((c) => c.code === code);
}

/**
 * Calculate the coordinated salary for BVG purposes
 * Coordinated salary = Gross salary - Coordination deduction
 * Capped at maximum insured salary
 */
export function calculateCoordinatedSalary(grossSalary: number): number {
  if (grossSalary <= CH_BVG_2026.entryThreshold) {
    return 0;
  }
  
  const coordinatedSalary = Math.min(
    grossSalary - CH_BVG_2026.coordinationDeduction,
    CH_BVG_2026.maxInsuredSalary
  );
  
  return Math.max(0, coordinatedSalary);
}
