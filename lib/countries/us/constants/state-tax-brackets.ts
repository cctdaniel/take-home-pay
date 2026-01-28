// ============================================================================
// 2026 US STATE TAX BRACKETS
// Update annually with state-specific announcements
// ============================================================================

import type { TaxBracket, USFilingStatus } from "../../types";

// ============================================================================
// NEW YORK TAX BRACKETS (2026)
// ============================================================================
export const NEW_YORK_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
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

export const NY_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 8000,
  married_jointly: 16050,
  married_separately: 8000,
  head_of_household: 11200,
};

export const NY_ADDITIONAL_TAXES = {
  nycResidentRate: 0.03876,
  sdiRate: 0.005,
  sdiMaxAnnual: 31.20,
  pflRate: 0.00373,
  pflWageBase: 91830,
};

// ============================================================================
// NEW JERSEY TAX BRACKETS (2026)
// ============================================================================
export const NEW_JERSEY_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
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

export const NJ_PERSONAL_EXEMPTIONS: Record<USFilingStatus, number> = {
  single: 1000,
  married_jointly: 2000,
  married_separately: 1000,
  head_of_household: 1500,
};

// ============================================================================
// GEORGIA TAX BRACKETS (2026) - Flat tax
// ============================================================================
export const GEORGIA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [{ min: 0, max: Infinity, rate: 0.0539 }],
  married_jointly: [{ min: 0, max: Infinity, rate: 0.0539 }],
  married_separately: [{ min: 0, max: Infinity, rate: 0.0539 }],
  head_of_household: [{ min: 0, max: Infinity, rate: 0.0539 }],
};

export const GA_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 12000,
  married_jointly: 24000,
  married_separately: 12000,
  head_of_household: 18000,
};

// ============================================================================
// FLAT TAX STATES (2026)
// ============================================================================
export const FLAT_TAX_RATES: Record<string, number> = {
  MA: 0.05,
  IL: 0.0495,
  PA: 0.0307,
  CO: 0.044,
  NC: 0.0525,
  MI: 0.0425,
  IN: 0.0305,
  UT: 0.0485,
  AZ: 0.025,
  ID: 0.058,
  KY: 0.04,
  MS: 0.05,
  ND: 0.0195,
  SC: 0.064,
};

export const FLAT_TAX_STATE_DEDUCTIONS: Record<string, Record<USFilingStatus, number>> = {
  MA: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  IL: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  PA: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  CO: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  NC: { single: 13100, married_jointly: 26200, married_separately: 13100, head_of_household: 19650 },
  MI: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  IN: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  UT: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  AZ: { single: 15000, married_jointly: 30000, married_separately: 15000, head_of_household: 22500 },
  ID: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  KY: { single: 3160, married_jointly: 6320, married_separately: 3160, head_of_household: 3160 },
  MS: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  ND: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
  SC: { single: 0, married_jointly: 0, married_separately: 0, head_of_household: 0 },
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
  CA: { rate: 0.012, wageBase: null },
  NY: { rate: 0.005, wageBase: 0 },
  NJ: { rate: 0.006, wageBase: 165800 },
  HI: { rate: 0.005, wageBase: 65600 },
  RI: { rate: 0.012, wageBase: 89400 },
  PR: { rate: 0.003, wageBase: 9000 },
};

// ============================================================================
// ALABAMA TAX BRACKETS (2026)
// ============================================================================
export const ALABAMA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 500, rate: 0.02 },
    { min: 500, max: 3000, rate: 0.04 },
    { min: 3000, max: Infinity, rate: 0.05 },
  ],
  married_jointly: [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 6000, rate: 0.04 },
    { min: 6000, max: Infinity, rate: 0.05 },
  ],
  married_separately: [
    { min: 0, max: 500, rate: 0.02 },
    { min: 500, max: 3000, rate: 0.04 },
    { min: 3000, max: Infinity, rate: 0.05 },
  ],
  head_of_household: [
    { min: 0, max: 500, rate: 0.02 },
    { min: 500, max: 3000, rate: 0.04 },
    { min: 3000, max: Infinity, rate: 0.05 },
  ],
};

export const AL_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 3000,
  married_jointly: 8500,
  married_separately: 4250,
  head_of_household: 5200,
};

// ============================================================================
// ARKANSAS TAX BRACKETS (2026)
// ============================================================================
export const ARKANSAS_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 5100, rate: 0.02 },
    { min: 5100, max: 10200, rate: 0.04 },
    { min: 10200, max: Infinity, rate: 0.039 },
  ],
  married_jointly: [
    { min: 0, max: 5100, rate: 0.02 },
    { min: 5100, max: 10200, rate: 0.04 },
    { min: 10200, max: Infinity, rate: 0.039 },
  ],
  married_separately: [
    { min: 0, max: 5100, rate: 0.02 },
    { min: 5100, max: 10200, rate: 0.04 },
    { min: 10200, max: Infinity, rate: 0.039 },
  ],
  head_of_household: [
    { min: 0, max: 5100, rate: 0.02 },
    { min: 5100, max: 10200, rate: 0.04 },
    { min: 10200, max: Infinity, rate: 0.039 },
  ],
};

export const AR_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 2340,
  married_jointly: 4680,
  married_separately: 2340,
  head_of_household: 2340,
};

// ============================================================================
// CONNECTICUT TAX BRACKETS (2026)
// ============================================================================
export const CONNECTICUT_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 10000, rate: 0.03 },
    { min: 10000, max: 50000, rate: 0.05 },
    { min: 50000, max: 100000, rate: 0.055 },
    { min: 100000, max: 200000, rate: 0.06 },
    { min: 200000, max: 250000, rate: 0.065 },
    { min: 250000, max: 500000, rate: 0.069 },
    { min: 500000, max: Infinity, rate: 0.0699 },
  ],
  married_jointly: [
    { min: 0, max: 20000, rate: 0.03 },
    { min: 20000, max: 100000, rate: 0.05 },
    { min: 100000, max: 200000, rate: 0.055 },
    { min: 200000, max: 400000, rate: 0.06 },
    { min: 400000, max: 500000, rate: 0.065 },
    { min: 500000, max: 1000000, rate: 0.069 },
    { min: 1000000, max: Infinity, rate: 0.0699 },
  ],
  married_separately: [
    { min: 0, max: 10000, rate: 0.03 },
    { min: 10000, max: 50000, rate: 0.05 },
    { min: 50000, max: 100000, rate: 0.055 },
    { min: 100000, max: 200000, rate: 0.06 },
    { min: 200000, max: 250000, rate: 0.065 },
    { min: 250000, max: 500000, rate: 0.069 },
    { min: 500000, max: Infinity, rate: 0.0699 },
  ],
  head_of_household: [
    { min: 0, max: 16000, rate: 0.03 },
    { min: 16000, max: 80000, rate: 0.05 },
    { min: 80000, max: 160000, rate: 0.055 },
    { min: 160000, max: 320000, rate: 0.06 },
    { min: 320000, max: 400000, rate: 0.065 },
    { min: 400000, max: 800000, rate: 0.069 },
    { min: 800000, max: Infinity, rate: 0.0699 },
  ],
};

export const CT_PERSONAL_EXEMPTIONS: Record<USFilingStatus, number> = {
  single: 15000,
  married_jointly: 24000,
  married_separately: 12000,
  head_of_household: 19000,
};

// ============================================================================
// DELAWARE TAX BRACKETS (2026)
// ============================================================================
export const DELAWARE_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 2000, rate: 0.0 },
    { min: 2000, max: 5000, rate: 0.022 },
    { min: 5000, max: 10000, rate: 0.039 },
    { min: 10000, max: 20000, rate: 0.048 },
    { min: 20000, max: 25000, rate: 0.052 },
    { min: 25000, max: 60000, rate: 0.0555 },
    { min: 60000, max: Infinity, rate: 0.066 },
  ],
  married_jointly: [
    { min: 0, max: 2000, rate: 0.0 },
    { min: 2000, max: 5000, rate: 0.022 },
    { min: 5000, max: 10000, rate: 0.039 },
    { min: 10000, max: 20000, rate: 0.048 },
    { min: 20000, max: 25000, rate: 0.052 },
    { min: 25000, max: 60000, rate: 0.0555 },
    { min: 60000, max: Infinity, rate: 0.066 },
  ],
  married_separately: [
    { min: 0, max: 2000, rate: 0.0 },
    { min: 2000, max: 5000, rate: 0.022 },
    { min: 5000, max: 10000, rate: 0.039 },
    { min: 10000, max: 20000, rate: 0.048 },
    { min: 20000, max: 25000, rate: 0.052 },
    { min: 25000, max: 60000, rate: 0.0555 },
    { min: 60000, max: Infinity, rate: 0.066 },
  ],
  head_of_household: [
    { min: 0, max: 2000, rate: 0.0 },
    { min: 2000, max: 5000, rate: 0.022 },
    { min: 5000, max: 10000, rate: 0.039 },
    { min: 10000, max: 20000, rate: 0.048 },
    { min: 20000, max: 25000, rate: 0.052 },
    { min: 25000, max: 60000, rate: 0.0555 },
    { min: 60000, max: Infinity, rate: 0.066 },
  ],
};

export const DE_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 3250,
  married_jointly: 6500,
  married_separately: 3250,
  head_of_household: 3250,
};

// ============================================================================
// DISTRICT OF COLUMBIA TAX BRACKETS (2026)
// ============================================================================
export const DC_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 10000, rate: 0.04 },
    { min: 10000, max: 40000, rate: 0.06 },
    { min: 40000, max: 60000, rate: 0.065 },
    { min: 60000, max: 250000, rate: 0.085 },
    { min: 250000, max: 500000, rate: 0.0925 },
    { min: 500000, max: 1000000, rate: 0.0975 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
  married_jointly: [
    { min: 0, max: 10000, rate: 0.04 },
    { min: 10000, max: 40000, rate: 0.06 },
    { min: 40000, max: 60000, rate: 0.065 },
    { min: 60000, max: 250000, rate: 0.085 },
    { min: 250000, max: 500000, rate: 0.0925 },
    { min: 500000, max: 1000000, rate: 0.0975 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
  married_separately: [
    { min: 0, max: 10000, rate: 0.04 },
    { min: 10000, max: 40000, rate: 0.06 },
    { min: 40000, max: 60000, rate: 0.065 },
    { min: 60000, max: 250000, rate: 0.085 },
    { min: 250000, max: 500000, rate: 0.0925 },
    { min: 500000, max: 1000000, rate: 0.0975 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
  head_of_household: [
    { min: 0, max: 10000, rate: 0.04 },
    { min: 10000, max: 40000, rate: 0.06 },
    { min: 40000, max: 60000, rate: 0.065 },
    { min: 60000, max: 250000, rate: 0.085 },
    { min: 250000, max: 500000, rate: 0.0925 },
    { min: 500000, max: 1000000, rate: 0.0975 },
    { min: 1000000, max: Infinity, rate: 0.1075 },
  ],
};

export const DC_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 14600,
  married_jointly: 29200,
  married_separately: 14600,
  head_of_household: 21900,
};

// ============================================================================
// HAWAII TAX BRACKETS (2026)
// ============================================================================
export const HAWAII_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 2400, rate: 0.014 },
    { min: 2400, max: 4800, rate: 0.032 },
    { min: 4800, max: 9600, rate: 0.055 },
    { min: 9600, max: 14400, rate: 0.064 },
    { min: 14400, max: 19200, rate: 0.068 },
    { min: 19200, max: 24000, rate: 0.072 },
    { min: 24000, max: 36000, rate: 0.076 },
    { min: 36000, max: 48000, rate: 0.079 },
    { min: 48000, max: 150000, rate: 0.0825 },
    { min: 150000, max: 175000, rate: 0.09 },
    { min: 175000, max: 200000, rate: 0.10 },
    { min: 200000, max: Infinity, rate: 0.11 },
  ],
  married_jointly: [
    { min: 0, max: 4800, rate: 0.014 },
    { min: 4800, max: 9600, rate: 0.032 },
    { min: 9600, max: 19200, rate: 0.055 },
    { min: 19200, max: 28800, rate: 0.064 },
    { min: 28800, max: 38400, rate: 0.068 },
    { min: 38400, max: 48000, rate: 0.072 },
    { min: 48000, max: 72000, rate: 0.076 },
    { min: 72000, max: 96000, rate: 0.079 },
    { min: 96000, max: 300000, rate: 0.0825 },
    { min: 300000, max: 350000, rate: 0.09 },
    { min: 350000, max: 400000, rate: 0.10 },
    { min: 400000, max: Infinity, rate: 0.11 },
  ],
  married_separately: [
    { min: 0, max: 2400, rate: 0.014 },
    { min: 2400, max: 4800, rate: 0.032 },
    { min: 4800, max: 9600, rate: 0.055 },
    { min: 9600, max: 14400, rate: 0.064 },
    { min: 14400, max: 19200, rate: 0.068 },
    { min: 19200, max: 24000, rate: 0.072 },
    { min: 24000, max: 36000, rate: 0.076 },
    { min: 36000, max: 48000, rate: 0.079 },
    { min: 48000, max: 150000, rate: 0.0825 },
    { min: 150000, max: 175000, rate: 0.09 },
    { min: 175000, max: 200000, rate: 0.10 },
    { min: 200000, max: Infinity, rate: 0.11 },
  ],
  head_of_household: [
    { min: 0, max: 3600, rate: 0.014 },
    { min: 3600, max: 7200, rate: 0.032 },
    { min: 7200, max: 14400, rate: 0.055 },
    { min: 14400, max: 21600, rate: 0.064 },
    { min: 21600, max: 28800, rate: 0.068 },
    { min: 28800, max: 36000, rate: 0.072 },
    { min: 36000, max: 54000, rate: 0.076 },
    { min: 54000, max: 72000, rate: 0.079 },
    { min: 72000, max: 225000, rate: 0.0825 },
    { min: 225000, max: 262500, rate: 0.09 },
    { min: 262500, max: 300000, rate: 0.10 },
    { min: 300000, max: Infinity, rate: 0.11 },
  ],
};

export const HI_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 2200,
  married_jointly: 4400,
  married_separately: 2200,
  head_of_household: 3212,
};

// ============================================================================
// REMAINING STATE BRACKETS (IOWA through WISCONSIN)
// Import from original file for brevity - these follow same pattern
// ============================================================================

export const IOWA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 6210, rate: 0.044 },
    { min: 6210, max: 31050, rate: 0.0482 },
    { min: 31050, max: Infinity, rate: 0.057 },
  ],
  married_jointly: [
    { min: 0, max: 12420, rate: 0.044 },
    { min: 12420, max: 62100, rate: 0.0482 },
    { min: 62100, max: Infinity, rate: 0.057 },
  ],
  married_separately: [
    { min: 0, max: 6210, rate: 0.044 },
    { min: 6210, max: 31050, rate: 0.0482 },
    { min: 31050, max: Infinity, rate: 0.057 },
  ],
  head_of_household: [
    { min: 0, max: 6210, rate: 0.044 },
    { min: 6210, max: 31050, rate: 0.0482 },
    { min: 31050, max: Infinity, rate: 0.057 },
  ],
};

export const IA_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 2210,
  married_jointly: 5450,
  married_separately: 2210,
  head_of_household: 5450,
};

export const KANSAS_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 15000, rate: 0.031 },
    { min: 15000, max: 30000, rate: 0.0525 },
    { min: 30000, max: Infinity, rate: 0.057 },
  ],
  married_jointly: [
    { min: 0, max: 30000, rate: 0.031 },
    { min: 30000, max: 60000, rate: 0.0525 },
    { min: 60000, max: Infinity, rate: 0.057 },
  ],
  married_separately: [
    { min: 0, max: 15000, rate: 0.031 },
    { min: 15000, max: 30000, rate: 0.0525 },
    { min: 30000, max: Infinity, rate: 0.057 },
  ],
  head_of_household: [
    { min: 0, max: 15000, rate: 0.031 },
    { min: 15000, max: 30000, rate: 0.0525 },
    { min: 30000, max: Infinity, rate: 0.057 },
  ],
};

export const KS_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 3500,
  married_jointly: 8000,
  married_separately: 4000,
  head_of_household: 6000,
};

export const LOUISIANA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 12500, rate: 0.0185 },
    { min: 12500, max: 50000, rate: 0.035 },
    { min: 50000, max: Infinity, rate: 0.0425 },
  ],
  married_jointly: [
    { min: 0, max: 25000, rate: 0.0185 },
    { min: 25000, max: 100000, rate: 0.035 },
    { min: 100000, max: Infinity, rate: 0.0425 },
  ],
  married_separately: [
    { min: 0, max: 12500, rate: 0.0185 },
    { min: 12500, max: 50000, rate: 0.035 },
    { min: 50000, max: Infinity, rate: 0.0425 },
  ],
  head_of_household: [
    { min: 0, max: 12500, rate: 0.0185 },
    { min: 12500, max: 50000, rate: 0.035 },
    { min: 50000, max: Infinity, rate: 0.0425 },
  ],
};

export const LA_PERSONAL_EXEMPTIONS: Record<USFilingStatus, number> = {
  single: 4500,
  married_jointly: 9000,
  married_separately: 4500,
  head_of_household: 4500,
};

export const MAINE_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 26050, rate: 0.058 },
    { min: 26050, max: 61600, rate: 0.0675 },
    { min: 61600, max: Infinity, rate: 0.0715 },
  ],
  married_jointly: [
    { min: 0, max: 52100, rate: 0.058 },
    { min: 52100, max: 123250, rate: 0.0675 },
    { min: 123250, max: Infinity, rate: 0.0715 },
  ],
  married_separately: [
    { min: 0, max: 26050, rate: 0.058 },
    { min: 26050, max: 61600, rate: 0.0675 },
    { min: 61600, max: Infinity, rate: 0.0715 },
  ],
  head_of_household: [
    { min: 0, max: 39100, rate: 0.058 },
    { min: 39100, max: 92450, rate: 0.0675 },
    { min: 92450, max: Infinity, rate: 0.0715 },
  ],
};

export const ME_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 14600,
  married_jointly: 29200,
  married_separately: 14600,
  head_of_household: 21900,
};

export const MARYLAND_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 2000, rate: 0.03 },
    { min: 2000, max: 3000, rate: 0.04 },
    { min: 3000, max: 100000, rate: 0.0475 },
    { min: 100000, max: 125000, rate: 0.05 },
    { min: 125000, max: 150000, rate: 0.0525 },
    { min: 150000, max: 250000, rate: 0.055 },
    { min: 250000, max: Infinity, rate: 0.0575 },
  ],
  married_jointly: [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 2000, rate: 0.03 },
    { min: 2000, max: 3000, rate: 0.04 },
    { min: 3000, max: 150000, rate: 0.0475 },
    { min: 150000, max: 175000, rate: 0.05 },
    { min: 175000, max: 225000, rate: 0.0525 },
    { min: 225000, max: 300000, rate: 0.055 },
    { min: 300000, max: Infinity, rate: 0.0575 },
  ],
  married_separately: [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 2000, rate: 0.03 },
    { min: 2000, max: 3000, rate: 0.04 },
    { min: 3000, max: 100000, rate: 0.0475 },
    { min: 100000, max: 125000, rate: 0.05 },
    { min: 125000, max: 150000, rate: 0.0525 },
    { min: 150000, max: 250000, rate: 0.055 },
    { min: 250000, max: Infinity, rate: 0.0575 },
  ],
  head_of_household: [
    { min: 0, max: 1000, rate: 0.02 },
    { min: 1000, max: 2000, rate: 0.03 },
    { min: 2000, max: 3000, rate: 0.04 },
    { min: 3000, max: 150000, rate: 0.0475 },
    { min: 150000, max: 175000, rate: 0.05 },
    { min: 175000, max: 225000, rate: 0.0525 },
    { min: 225000, max: 300000, rate: 0.055 },
    { min: 300000, max: Infinity, rate: 0.0575 },
  ],
};

export const MD_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 2550,
  married_jointly: 5150,
  married_separately: 2550,
  head_of_household: 5150,
};

export const MINNESOTA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 31690, rate: 0.0535 },
    { min: 31690, max: 104090, rate: 0.068 },
    { min: 104090, max: 193240, rate: 0.0785 },
    { min: 193240, max: Infinity, rate: 0.0985 },
  ],
  married_jointly: [
    { min: 0, max: 46330, rate: 0.0535 },
    { min: 46330, max: 184040, rate: 0.068 },
    { min: 184040, max: 321450, rate: 0.0785 },
    { min: 321450, max: Infinity, rate: 0.0985 },
  ],
  married_separately: [
    { min: 0, max: 23165, rate: 0.0535 },
    { min: 23165, max: 92020, rate: 0.068 },
    { min: 92020, max: 160725, rate: 0.0785 },
    { min: 160725, max: Infinity, rate: 0.0985 },
  ],
  head_of_household: [
    { min: 0, max: 39010, rate: 0.0535 },
    { min: 39010, max: 156370, rate: 0.068 },
    { min: 156370, max: 256880, rate: 0.0785 },
    { min: 256880, max: Infinity, rate: 0.0985 },
  ],
};

export const MN_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 14575,
  married_jointly: 29150,
  married_separately: 14575,
  head_of_household: 21900,
};

export const MISSOURI_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 1207, rate: 0.0 },
    { min: 1207, max: 2414, rate: 0.02 },
    { min: 2414, max: 3621, rate: 0.025 },
    { min: 3621, max: 4828, rate: 0.03 },
    { min: 4828, max: 6035, rate: 0.035 },
    { min: 6035, max: 7242, rate: 0.04 },
    { min: 7242, max: 8449, rate: 0.045 },
    { min: 8449, max: Infinity, rate: 0.048 },
  ],
  married_jointly: [
    { min: 0, max: 1207, rate: 0.0 },
    { min: 1207, max: 2414, rate: 0.02 },
    { min: 2414, max: 3621, rate: 0.025 },
    { min: 3621, max: 4828, rate: 0.03 },
    { min: 4828, max: 6035, rate: 0.035 },
    { min: 6035, max: 7242, rate: 0.04 },
    { min: 7242, max: 8449, rate: 0.045 },
    { min: 8449, max: Infinity, rate: 0.048 },
  ],
  married_separately: [
    { min: 0, max: 1207, rate: 0.0 },
    { min: 1207, max: 2414, rate: 0.02 },
    { min: 2414, max: 3621, rate: 0.025 },
    { min: 3621, max: 4828, rate: 0.03 },
    { min: 4828, max: 6035, rate: 0.035 },
    { min: 6035, max: 7242, rate: 0.04 },
    { min: 7242, max: 8449, rate: 0.045 },
    { min: 8449, max: Infinity, rate: 0.048 },
  ],
  head_of_household: [
    { min: 0, max: 1207, rate: 0.0 },
    { min: 1207, max: 2414, rate: 0.02 },
    { min: 2414, max: 3621, rate: 0.025 },
    { min: 3621, max: 4828, rate: 0.03 },
    { min: 4828, max: 6035, rate: 0.035 },
    { min: 6035, max: 7242, rate: 0.04 },
    { min: 7242, max: 8449, rate: 0.045 },
    { min: 8449, max: Infinity, rate: 0.048 },
  ],
};

export const MO_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 14600,
  married_jointly: 29200,
  married_separately: 14600,
  head_of_household: 21900,
};

export const MONTANA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 20500, rate: 0.047 },
    { min: 20500, max: Infinity, rate: 0.059 },
  ],
  married_jointly: [
    { min: 0, max: 41000, rate: 0.047 },
    { min: 41000, max: Infinity, rate: 0.059 },
  ],
  married_separately: [
    { min: 0, max: 20500, rate: 0.047 },
    { min: 20500, max: Infinity, rate: 0.059 },
  ],
  head_of_household: [
    { min: 0, max: 20500, rate: 0.047 },
    { min: 20500, max: Infinity, rate: 0.059 },
  ],
};

export const MT_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 5540,
  married_jointly: 11080,
  married_separately: 5540,
  head_of_household: 8310,
};

export const NEBRASKA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 3700, rate: 0.0246 },
    { min: 3700, max: 22170, rate: 0.0351 },
    { min: 22170, max: 35730, rate: 0.0501 },
    { min: 35730, max: Infinity, rate: 0.0584 },
  ],
  married_jointly: [
    { min: 0, max: 7390, rate: 0.0246 },
    { min: 7390, max: 44350, rate: 0.0351 },
    { min: 44350, max: 71460, rate: 0.0501 },
    { min: 71460, max: Infinity, rate: 0.0584 },
  ],
  married_separately: [
    { min: 0, max: 3700, rate: 0.0246 },
    { min: 3700, max: 22170, rate: 0.0351 },
    { min: 22170, max: 35730, rate: 0.0501 },
    { min: 35730, max: Infinity, rate: 0.0584 },
  ],
  head_of_household: [
    { min: 0, max: 6620, rate: 0.0246 },
    { min: 6620, max: 33090, rate: 0.0351 },
    { min: 33090, max: 53600, rate: 0.0501 },
    { min: 53600, max: Infinity, rate: 0.0584 },
  ],
};

export const NE_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 7900,
  married_jointly: 15800,
  married_separately: 7900,
  head_of_household: 11600,
};

export const NEW_MEXICO_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 5500, rate: 0.017 },
    { min: 5500, max: 11000, rate: 0.032 },
    { min: 11000, max: 16000, rate: 0.047 },
    { min: 16000, max: 210000, rate: 0.049 },
    { min: 210000, max: Infinity, rate: 0.059 },
  ],
  married_jointly: [
    { min: 0, max: 8000, rate: 0.017 },
    { min: 8000, max: 16000, rate: 0.032 },
    { min: 16000, max: 24000, rate: 0.047 },
    { min: 24000, max: 315000, rate: 0.049 },
    { min: 315000, max: Infinity, rate: 0.059 },
  ],
  married_separately: [
    { min: 0, max: 4000, rate: 0.017 },
    { min: 4000, max: 8000, rate: 0.032 },
    { min: 8000, max: 12000, rate: 0.047 },
    { min: 12000, max: 157500, rate: 0.049 },
    { min: 157500, max: Infinity, rate: 0.059 },
  ],
  head_of_household: [
    { min: 0, max: 8000, rate: 0.017 },
    { min: 8000, max: 16000, rate: 0.032 },
    { min: 16000, max: 24000, rate: 0.047 },
    { min: 24000, max: 315000, rate: 0.049 },
    { min: 315000, max: Infinity, rate: 0.059 },
  ],
};

export const NM_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 14600,
  married_jointly: 29200,
  married_separately: 14600,
  head_of_household: 21900,
};

export const OHIO_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 26050, rate: 0.0 },
    { min: 26050, max: 100000, rate: 0.0275 },
    { min: 100000, max: Infinity, rate: 0.035 },
  ],
  married_jointly: [
    { min: 0, max: 26050, rate: 0.0 },
    { min: 26050, max: 100000, rate: 0.0275 },
    { min: 100000, max: Infinity, rate: 0.035 },
  ],
  married_separately: [
    { min: 0, max: 26050, rate: 0.0 },
    { min: 26050, max: 100000, rate: 0.0275 },
    { min: 100000, max: Infinity, rate: 0.035 },
  ],
  head_of_household: [
    { min: 0, max: 26050, rate: 0.0 },
    { min: 26050, max: 100000, rate: 0.0275 },
    { min: 100000, max: Infinity, rate: 0.035 },
  ],
};

export const OH_PERSONAL_EXEMPTIONS: Record<USFilingStatus, number> = {
  single: 2400,
  married_jointly: 4800,
  married_separately: 2400,
  head_of_household: 2400,
};

export const OKLAHOMA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 1000, rate: 0.0025 },
    { min: 1000, max: 2500, rate: 0.0075 },
    { min: 2500, max: 3750, rate: 0.0175 },
    { min: 3750, max: 4900, rate: 0.0275 },
    { min: 4900, max: 7200, rate: 0.0375 },
    { min: 7200, max: Infinity, rate: 0.0475 },
  ],
  married_jointly: [
    { min: 0, max: 2000, rate: 0.0025 },
    { min: 2000, max: 5000, rate: 0.0075 },
    { min: 5000, max: 7500, rate: 0.0175 },
    { min: 7500, max: 9800, rate: 0.0275 },
    { min: 9800, max: 12200, rate: 0.0375 },
    { min: 12200, max: Infinity, rate: 0.0475 },
  ],
  married_separately: [
    { min: 0, max: 1000, rate: 0.0025 },
    { min: 1000, max: 2500, rate: 0.0075 },
    { min: 2500, max: 3750, rate: 0.0175 },
    { min: 3750, max: 4900, rate: 0.0275 },
    { min: 4900, max: 7200, rate: 0.0375 },
    { min: 7200, max: Infinity, rate: 0.0475 },
  ],
  head_of_household: [
    { min: 0, max: 2000, rate: 0.0025 },
    { min: 2000, max: 5000, rate: 0.0075 },
    { min: 5000, max: 7500, rate: 0.0175 },
    { min: 7500, max: 9800, rate: 0.0275 },
    { min: 9800, max: 12200, rate: 0.0375 },
    { min: 12200, max: Infinity, rate: 0.0475 },
  ],
};

export const OK_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 6350,
  married_jointly: 12700,
  married_separately: 6350,
  head_of_household: 9350,
};

export const OREGON_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 4300, rate: 0.0475 },
    { min: 4300, max: 10750, rate: 0.0675 },
    { min: 10750, max: 125000, rate: 0.0875 },
    { min: 125000, max: Infinity, rate: 0.099 },
  ],
  married_jointly: [
    { min: 0, max: 8600, rate: 0.0475 },
    { min: 8600, max: 21500, rate: 0.0675 },
    { min: 21500, max: 250000, rate: 0.0875 },
    { min: 250000, max: Infinity, rate: 0.099 },
  ],
  married_separately: [
    { min: 0, max: 4300, rate: 0.0475 },
    { min: 4300, max: 10750, rate: 0.0675 },
    { min: 10750, max: 125000, rate: 0.0875 },
    { min: 125000, max: Infinity, rate: 0.099 },
  ],
  head_of_household: [
    { min: 0, max: 8600, rate: 0.0475 },
    { min: 8600, max: 21500, rate: 0.0675 },
    { min: 21500, max: 250000, rate: 0.0875 },
    { min: 250000, max: Infinity, rate: 0.099 },
  ],
};

export const OR_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 2605,
  married_jointly: 5210,
  married_separately: 2605,
  head_of_household: 4195,
};

export const RHODE_ISLAND_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 77450, rate: 0.0375 },
    { min: 77450, max: 176050, rate: 0.0475 },
    { min: 176050, max: Infinity, rate: 0.0599 },
  ],
  married_jointly: [
    { min: 0, max: 77450, rate: 0.0375 },
    { min: 77450, max: 176050, rate: 0.0475 },
    { min: 176050, max: Infinity, rate: 0.0599 },
  ],
  married_separately: [
    { min: 0, max: 77450, rate: 0.0375 },
    { min: 77450, max: 176050, rate: 0.0475 },
    { min: 176050, max: Infinity, rate: 0.0599 },
  ],
  head_of_household: [
    { min: 0, max: 77450, rate: 0.0375 },
    { min: 77450, max: 176050, rate: 0.0475 },
    { min: 176050, max: Infinity, rate: 0.0599 },
  ],
};

export const RI_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 10550,
  married_jointly: 21100,
  married_separately: 10550,
  head_of_household: 15825,
};

export const VERMONT_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 45400, rate: 0.0335 },
    { min: 45400, max: 110050, rate: 0.066 },
    { min: 110050, max: 229550, rate: 0.076 },
    { min: 229550, max: Infinity, rate: 0.0875 },
  ],
  married_jointly: [
    { min: 0, max: 75850, rate: 0.0335 },
    { min: 75850, max: 183400, rate: 0.066 },
    { min: 183400, max: 279450, rate: 0.076 },
    { min: 279450, max: Infinity, rate: 0.0875 },
  ],
  married_separately: [
    { min: 0, max: 37925, rate: 0.0335 },
    { min: 37925, max: 91700, rate: 0.066 },
    { min: 91700, max: 139725, rate: 0.076 },
    { min: 139725, max: Infinity, rate: 0.0875 },
  ],
  head_of_household: [
    { min: 0, max: 60700, rate: 0.0335 },
    { min: 60700, max: 156700, rate: 0.066 },
    { min: 156700, max: 254450, rate: 0.076 },
    { min: 254450, max: Infinity, rate: 0.0875 },
  ],
};

export const VT_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 7000,
  married_jointly: 15700,
  married_separately: 7850,
  head_of_household: 11600,
};

export const VIRGINIA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 3000, rate: 0.02 },
    { min: 3000, max: 5000, rate: 0.03 },
    { min: 5000, max: 17000, rate: 0.05 },
    { min: 17000, max: Infinity, rate: 0.0575 },
  ],
  married_jointly: [
    { min: 0, max: 3000, rate: 0.02 },
    { min: 3000, max: 5000, rate: 0.03 },
    { min: 5000, max: 17000, rate: 0.05 },
    { min: 17000, max: Infinity, rate: 0.0575 },
  ],
  married_separately: [
    { min: 0, max: 3000, rate: 0.02 },
    { min: 3000, max: 5000, rate: 0.03 },
    { min: 5000, max: 17000, rate: 0.05 },
    { min: 17000, max: Infinity, rate: 0.0575 },
  ],
  head_of_household: [
    { min: 0, max: 3000, rate: 0.02 },
    { min: 3000, max: 5000, rate: 0.03 },
    { min: 5000, max: 17000, rate: 0.05 },
    { min: 17000, max: Infinity, rate: 0.0575 },
  ],
};

export const VA_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 8500,
  married_jointly: 17000,
  married_separately: 8500,
  head_of_household: 8500,
};

export const WEST_VIRGINIA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 10000, rate: 0.0236 },
    { min: 10000, max: 25000, rate: 0.0315 },
    { min: 25000, max: 40000, rate: 0.0354 },
    { min: 40000, max: 60000, rate: 0.0472 },
    { min: 60000, max: Infinity, rate: 0.0512 },
  ],
  married_jointly: [
    { min: 0, max: 10000, rate: 0.0236 },
    { min: 10000, max: 25000, rate: 0.0315 },
    { min: 25000, max: 40000, rate: 0.0354 },
    { min: 40000, max: 60000, rate: 0.0472 },
    { min: 60000, max: Infinity, rate: 0.0512 },
  ],
  married_separately: [
    { min: 0, max: 10000, rate: 0.0236 },
    { min: 10000, max: 25000, rate: 0.0315 },
    { min: 25000, max: 40000, rate: 0.0354 },
    { min: 40000, max: 60000, rate: 0.0472 },
    { min: 60000, max: Infinity, rate: 0.0512 },
  ],
  head_of_household: [
    { min: 0, max: 10000, rate: 0.0236 },
    { min: 10000, max: 25000, rate: 0.0315 },
    { min: 25000, max: 40000, rate: 0.0354 },
    { min: 40000, max: 60000, rate: 0.0472 },
    { min: 60000, max: Infinity, rate: 0.0512 },
  ],
};

export const WV_PERSONAL_EXEMPTIONS: Record<USFilingStatus, number> = {
  single: 2000,
  married_jointly: 4000,
  married_separately: 2000,
  head_of_household: 2000,
};

export const WISCONSIN_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 14320, rate: 0.035 },
    { min: 14320, max: 28640, rate: 0.044 },
    { min: 28640, max: 315310, rate: 0.053 },
    { min: 315310, max: Infinity, rate: 0.0765 },
  ],
  married_jointly: [
    { min: 0, max: 19090, rate: 0.035 },
    { min: 19090, max: 38190, rate: 0.044 },
    { min: 38190, max: 420420, rate: 0.053 },
    { min: 420420, max: Infinity, rate: 0.0765 },
  ],
  married_separately: [
    { min: 0, max: 9545, rate: 0.035 },
    { min: 9545, max: 19095, rate: 0.044 },
    { min: 19095, max: 210210, rate: 0.053 },
    { min: 210210, max: Infinity, rate: 0.0765 },
  ],
  head_of_household: [
    { min: 0, max: 14320, rate: 0.035 },
    { min: 14320, max: 28640, rate: 0.044 },
    { min: 28640, max: 315310, rate: 0.053 },
    { min: 315310, max: Infinity, rate: 0.0765 },
  ],
};

export const WI_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 13230,
  married_jointly: 24480,
  married_separately: 11510,
  head_of_household: 16290,
};
