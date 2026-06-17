import type { TaxBracket } from "../../types";

// Nigeria salary tax parameters — NTA 2025
// Sources: Nigeria Tax Act 2025 Fourth Schedule

export const NG_TAX_YEAR = 2026;

export const NG_SOURCE_URLS = {
  paye: "https://www.firs.gov.ng/",
  pension: "https://www.pencom.gov.ng/",
} as const;

/** Mandatory employee pension contribution (Pension Reform Act). */
export const NG_PENSION_2026 = {
  employeeRate: 0.08,
} as const;

/** Additional voluntary contributions (AVC) deductible under NTA 2025 §30(2)(a)(iii). */
export const NG_AVC_MAX_ADDITIONAL_RATE = 0.1;

/** NTA 2025 PAYE brackets on chargeable income after pension. */
export const NG_PAYE_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 800_000, rate: 0 },
  { min: 800_000, max: 3_000_000, rate: 0.15 },
  { min: 3_000_000, max: 12_000_000, rate: 0.18 },
  { min: 12_000_000, max: 25_000_000, rate: 0.21 },
  { min: 25_000_000, max: 50_000_000, rate: 0.23 },
  { min: 50_000_000, max: Infinity, rate: 0.25 },
];
