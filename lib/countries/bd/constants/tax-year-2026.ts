import type { TaxBracket } from "../../types";

// Bangladesh salary tax parameters — FY 2026-27
// Sources: https://nbr.gov.bd/

export const BD_TAX_YEAR = 2026;

export const BD_SOURCE_URLS = {
  incomeTax: "https://nbr.gov.bd/",
} as const;

/** FY 2026-27 annual salary tax slabs (BDT). No employee social insurance modeled. */
export const BD_PIT_BRACKETS_FY2026: TaxBracket[] = [
  { min: 0, max: 375_000, rate: 0 },
  { min: 375_000, max: 675_000, rate: 0.1 },
  { min: 675_000, max: 1_075_000, rate: 0.15 },
  { min: 1_075_000, max: 1_575_000, rate: 0.2 },
  { min: 1_575_000, max: 3_575_000, rate: 0.25 },
  { min: 3_575_000, max: Infinity, rate: 0.3 },
];
