// ============================================================================
// 2026 US FEDERAL TAX BRACKETS
// Source: IRS Pub. 505 (2026), Tax Withholding and Estimated Tax
// ============================================================================

import type { TaxBracket, USFilingStatus } from "../../types";

export const US_SOURCE_URLS = [
  "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill/",
  "https://www.irs.gov/Retirement-Plans",
  "https://www.irs.gov/irb/2025-21_IRB/index.html",
  "https://www.irs.gov/publications/p15b",
  "https://www.ssa.gov/OACT/cola/cbb.html",
  "https://www.irs.gov/affordable-care-act/affordable-care-act-tax-provisions",
] as const;

export const FEDERAL_TAX_BRACKETS: Record<USFilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ],
  married_jointly: [
    { min: 0, max: 24800, rate: 0.10 },
    { min: 24800, max: 100800, rate: 0.12 },
    { min: 100800, max: 211400, rate: 0.22 },
    { min: 211400, max: 403550, rate: 0.24 },
    { min: 403550, max: 512450, rate: 0.32 },
    { min: 512450, max: 768700, rate: 0.35 },
    { min: 768700, max: Infinity, rate: 0.37 },
  ],
  married_separately: [
    { min: 0, max: 12400, rate: 0.10 },
    { min: 12400, max: 50400, rate: 0.12 },
    { min: 50400, max: 105700, rate: 0.22 },
    { min: 105700, max: 201775, rate: 0.24 },
    { min: 201775, max: 256225, rate: 0.32 },
    { min: 256225, max: 384350, rate: 0.35 },
    { min: 384350, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17700, rate: 0.10 },
    { min: 17700, max: 67450, rate: 0.12 },
    { min: 67450, max: 105700, rate: 0.22 },
    { min: 105700, max: 201750, rate: 0.24 },
    { min: 201750, max: 256200, rate: 0.32 },
    { min: 256200, max: 640600, rate: 0.35 },
    { min: 640600, max: Infinity, rate: 0.37 },
  ],
};

// ============================================================================
// 2026 STANDARD DEDUCTIONS
// ============================================================================
export const STANDARD_DEDUCTIONS: Record<USFilingStatus, number> = {
  single: 16100,
  married_jointly: 32200,
  married_separately: 16100,
  head_of_household: 24150,
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
