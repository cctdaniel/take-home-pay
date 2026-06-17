import type { TaxBracket } from "../../types";

// Mauritius salary tax parameters — 2026
// Sources: https://www.mra.mu/

export const MU_TAX_YEAR = 2026;

export const MU_SOURCE_URLS = {
  incomeTax: "https://www.mra.mu/",
  socialContributions: "https://www.mra.mu/",
} as const;

/** CSG rate when monthly gross is at or below threshold. */
export const MU_CSG_RATE_LOW = 0.015;

/** CSG rate when monthly gross exceeds threshold. */
export const MU_CSG_RATE_HIGH = 0.03;

/** Monthly gross threshold for CSG tier (MUR). */
export const MU_CSG_MONTHLY_THRESHOLD = 50_000;

/** PAYE brackets on income after CSG (annual MUR). */
export const MU_PAYE_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 500_000, rate: 0 },
  { min: 500_000, max: 1_000_000, rate: 0.1 },
  { min: 1_000_000, max: Infinity, rate: 0.2 },
];
