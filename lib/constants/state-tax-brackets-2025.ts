// ============================================================================
// 2026 STATE TAX BRACKETS
// Update annually with state-specific announcements
// ============================================================================

import type { FilingStatus, TaxBracket } from "./tax-brackets-2026";

// ============================================================================
// NEW YORK TAX BRACKETS (2026)
// ============================================================================
export const NEW_YORK_TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 8500, rate: 0.04 },
    { min: 8500, max: 11700, rate: 0.045 },
    { min: 11700, max: 13900, rate: 0.0525 },
    { min: 13900, max: 80650, rate: 0.0585 },
    { min: 80650, max: 215400, rate: 0.0625 },
    { min: 215400, max: 1077550, rate: 0.0685 },
    { min: 1077550, max: 5000000, rate: 0.0965 },
    { min: 5000000, max: 25000000, rate: 0.103 },
    { min: 25000000, max: Infinity, rate: 0.109 },
  ],
  married_jointly: [
    { min: 0, max: 17150, rate: 0.04 },
    { min: 17150, max: 23600, rate: 0.045 },
    { min: 23600, max: 27900, rate: 0.0525 },
    { min: 27900, max: 161550, rate: 0.0585 },
    { min: 161550, max: 323200, rate: 0.0625 },
    { min: 323200, max: 2155350, rate: 0.0685 },
    { min: 2155350, max: 5000000, rate: 0.0965 },
    { min: 5000000, max: 25000000, rate: 0.103 },
    { min: 25000000, max: Infinity, rate: 0.109 },
  ],
  married_separately: [
    { min: 0, max: 8500, rate: 0.04 },
    { min: 8500, max: 11700, rate: 0.045 },
    { min: 11700, max: 13900, rate: 0.0525 },
    { min: 13900, max: 80650, rate: 0.0585 },
    { min: 80650, max: 215400, rate: 0.0625 },
    { min: 215400, max: 1077550, rate: 0.0685 },
    { min: 1077550, max: 5000000, rate: 0.0965 },
    { min: 5000000, max: 25000000, rate: 0.103 },
    { min: 25000000, max: Infinity, rate: 0.109 },
  ],
  head_of_household: [
    { min: 0, max: 12800, rate: 0.04 },
    { min: 12800, max: 17650, rate: 0.045 },
    { min: 17650, max: 20900, rate: 0.0525 },
    { min: 20900, max: 107650, rate: 0.0585 },
    { min: 107650, max: 269300, rate: 0.0625 },
    { min: 269300, max: 1616450, rate: 0.0685 },
    { min: 1616450, max: 5000000, rate: 0.0965 },
    { min: 5000000, max: 25000000, rate: 0.103 },
    { min: 25000000, max: Infinity, rate: 0.109 },
  ],
};

export const NY_STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 8000,
  married_jointly: 16050,
  married_separately: 8000,
  head_of_household: 11200,
};

// ============================================================================
// NEW JERSEY TAX BRACKETS (2026)
// ============================================================================
export const NEW_JERSEY_TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 20000, rate: 0.014 },
    { min: 20000, max: 35000, rate: 0.0175 },
    { min: 35000, max: 40000, rate: 0.035 },
    { min: 40000, max: 75000, rate: 0.05525 },
    { min: 75000, max: 500000, rate: 0.0637 },
    { min: 500000, max: 1000000, rate: 0.0897 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
  married_jointly: [
    { min: 0, max: 20000, rate: 0.014 },
    { min: 20000, max: 50000, rate: 0.0175 },
    { min: 50000, max: 70000, rate: 0.0245 },
    { min: 70000, max: 80000, rate: 0.035 },
    { min: 80000, max: 150000, rate: 0.05525 },
    { min: 150000, max: 500000, rate: 0.0637 },
    { min: 500000, max: 1000000, rate: 0.0897 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
  married_separately: [
    { min: 0, max: 20000, rate: 0.014 },
    { min: 20000, max: 35000, rate: 0.0175 },
    { min: 35000, max: 40000, rate: 0.035 },
    { min: 40000, max: 75000, rate: 0.05525 },
    { min: 75000, max: 500000, rate: 0.0637 },
    { min: 500000, max: 1000000, rate: 0.0897 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
  head_of_household: [
    { min: 0, max: 20000, rate: 0.014 },
    { min: 20000, max: 50000, rate: 0.0175 },
    { min: 50000, max: 70000, rate: 0.0245 },
    { min: 70000, max: 80000, rate: 0.035 },
    { min: 80000, max: 150000, rate: 0.05525 },
    { min: 150000, max: 500000, rate: 0.0637 },
    { min: 500000, max: 1000000, rate: 0.0897 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
};

export const NJ_PERSONAL_EXEMPTIONS: Record<FilingStatus, number> = {
  single: 1000,
  married_jointly: 2000,
  married_separately: 1000,
  head_of_household: 1500,
};

// ============================================================================
// GEORGIA TAX BRACKETS (2026) - Flat tax
// ============================================================================
export const GEORGIA_TAX_BRACKETS: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: Infinity, rate: 0.0539 }, // Reduced from 5.49% in 2025
  ],
  married_jointly: [
    { min: 0, max: Infinity, rate: 0.0539 },
  ],
  married_separately: [
    { min: 0, max: Infinity, rate: 0.0539 },
  ],
  head_of_household: [
    { min: 0, max: Infinity, rate: 0.0539 },
  ],
};

export const GA_STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 12000,
  married_jointly: 24000,
  married_separately: 12000,
  head_of_household: 18000,
};

// ============================================================================
// FLAT TAX STATES (2026)
// ============================================================================
export const FLAT_TAX_RATES: Record<string, number> = {
  MA: 0.05,      // Massachusetts
  IL: 0.0495,    // Illinois
  PA: 0.0307,    // Pennsylvania
  CO: 0.044,     // Colorado
  NC: 0.0525,    // North Carolina (decreasing gradually)
  MI: 0.0425,    // Michigan
  IN: 0.0305,    // Indiana (reduced from 3.15%)
  UT: 0.0485,    // Utah
  AZ: 0.025,     // Arizona
};

export const FLAT_TAX_STATE_DEDUCTIONS: Record<string, Record<FilingStatus, number>> = {
  MA: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  IL: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  PA: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  CO: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  NC: { single: 13100, married_jointly: 26200, married_separately: 13100, head_of_household: 19650 },
  MI: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  IN: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  UT: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  AZ: { single: 15000, married_jointly: 30000, married_separately: 15000, head_of_household: 22500 },
};

// ============================================================================
// NO INCOME TAX STATES
// ============================================================================
export const NO_INCOME_TAX_STATES = ["TX", "WA", "FL", "NV", "WY", "AK", "SD", "TN", "NH"] as const;
export type NoIncomeTaxState = typeof NO_INCOME_TAX_STATES[number];

// ============================================================================
// STATE DISABILITY/UNEMPLOYMENT INSURANCE RATES (2026)
// ============================================================================
export const STATE_DISABILITY_RATES: Record<string, { rate: number; wageBase: number | null }> = {
  CA: { rate: 0.012, wageBase: null },     // No cap
  NY: { rate: 0.005, wageBase: 0 },        // Minimal
  NJ: { rate: 0.006, wageBase: 165800 },   // SDI (wage base increased)
  HI: { rate: 0.005, wageBase: 65600 },    // TDI
  RI: { rate: 0.012, wageBase: 89400 },    // TDI
  PR: { rate: 0.003, wageBase: 9000 },     // SINOT
};

// NY additional payroll taxes (2026)
export const NY_ADDITIONAL_TAXES = {
  nycResidentRate: 0.03876,
  sdiRate: 0.005,
  sdiMaxAnnual: 31.20,
  pflRate: 0.00373,
  pflWageBase: 91830, // Increased for 2026
};
