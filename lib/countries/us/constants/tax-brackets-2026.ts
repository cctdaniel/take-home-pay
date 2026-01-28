// ============================================================================
// 2026 US FEDERAL TAX BRACKETS
// Source: IRS Revenue Procedure (released October 2025)
// Inflation adjustment: ~2.8% from 2025
// ============================================================================

import type { TaxBracket, USFilingStatus } from "../../types";

export const FEDERAL_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 12250, rate: 0.10 },
    { min: 12250, max: 49850, rate: 0.12 },
    { min: 49850, max: 106250, rate: 0.22 },
    { min: 106250, max: 202850, rate: 0.24 },
    { min: 202850, max: 257550, rate: 0.32 },
    { min: 257550, max: 643900, rate: 0.35 },
    { min: 643900, max: Infinity, rate: 0.37 },
  ],
  married_jointly: [
    { min: 0, max: 24500, rate: 0.10 },
    { min: 24500, max: 99700, rate: 0.12 },
    { min: 99700, max: 212500, rate: 0.22 },
    { min: 212500, max: 405700, rate: 0.24 },
    { min: 405700, max: 515100, rate: 0.32 },
    { min: 515100, max: 772650, rate: 0.35 },
    { min: 772650, max: Infinity, rate: 0.37 },
  ],
  married_separately: [
    { min: 0, max: 12250, rate: 0.10 },
    { min: 12250, max: 49850, rate: 0.12 },
    { min: 49850, max: 106250, rate: 0.22 },
    { min: 106250, max: 202850, rate: 0.24 },
    { min: 202850, max: 257550, rate: 0.32 },
    { min: 257550, max: 386325, rate: 0.35 },
    { min: 386325, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17500, rate: 0.10 },
    { min: 17500, max: 66700, rate: 0.12 },
    { min: 66700, max: 106250, rate: 0.22 },
    { min: 106250, max: 202850, rate: 0.24 },
    { min: 202850, max: 257550, rate: 0.32 },
    { min: 257550, max: 643900, rate: 0.35 },
    { min: 643900, max: Infinity, rate: 0.37 },
  ],
};

// ============================================================================
// 2026 STANDARD DEDUCTIONS
// ============================================================================
export const STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 15400,
  married_jointly: 30800,
  married_separately: 15400,
  head_of_household: 23100,
};

// ============================================================================
// 2026 CALIFORNIA TAX BRACKETS
// ============================================================================
export const CALIFORNIA_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11055, rate: 0.01 },
    { min: 11055, max: 26210, rate: 0.02 },
    { min: 26210, max: 41370, rate: 0.04 },
    { min: 41370, max: 57430, rate: 0.06 },
    { min: 57430, max: 72580, rate: 0.08 },
    { min: 72580, max: 370760, rate: 0.093 },
    { min: 370760, max: 444910, rate: 0.103 },
    { min: 444910, max: 741510, rate: 0.113 },
    { min: 741510, max: 1000000, rate: 0.123 },
    { min: 1000000, max: Infinity, rate: 0.133 },
  ],
  married_jointly: [
    { min: 0, max: 22110, rate: 0.01 },
    { min: 22110, max: 52420, rate: 0.02 },
    { min: 52420, max: 82740, rate: 0.04 },
    { min: 82740, max: 114860, rate: 0.06 },
    { min: 114860, max: 145160, rate: 0.08 },
    { min: 145160, max: 741520, rate: 0.093 },
    { min: 741520, max: 889820, rate: 0.103 },
    { min: 889820, max: 1483040, rate: 0.113 },
    { min: 1483040, max: 2000000, rate: 0.123 },
    { min: 2000000, max: Infinity, rate: 0.133 },
  ],
  married_separately: [
    { min: 0, max: 11055, rate: 0.01 },
    { min: 11055, max: 26210, rate: 0.02 },
    { min: 26210, max: 41370, rate: 0.04 },
    { min: 41370, max: 57430, rate: 0.06 },
    { min: 57430, max: 72580, rate: 0.08 },
    { min: 72580, max: 370760, rate: 0.093 },
    { min: 370760, max: 444910, rate: 0.103 },
    { min: 444910, max: 741510, rate: 0.113 },
    { min: 741510, max: 1000000, rate: 0.123 },
    { min: 1000000, max: Infinity, rate: 0.133 },
  ],
  head_of_household: [
    { min: 0, max: 22130, rate: 0.01 },
    { min: 22130, max: 52440, rate: 0.02 },
    { min: 52440, max: 67600, rate: 0.04 },
    { min: 67600, max: 83660, rate: 0.06 },
    { min: 83660, max: 98820, rate: 0.08 },
    { min: 98820, max: 504230, rate: 0.093 },
    { min: 504230, max: 605110, rate: 0.103 },
    { min: 605110, max: 1008460, rate: 0.113 },
    { min: 1008460, max: 1000000, rate: 0.123 },
    { min: 1000000, max: Infinity, rate: 0.133 },
  ],
};

// California standard deduction 2026
export const CA_STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 5695,
  married_jointly: 11390,
  married_separately: 5695,
  head_of_household: 11390,
};
