import type { TaxBracket } from "../../types";

// MCI (monthly calculation index) 2026 — official Kazakhstan parameter.
// https://www.gov.kz/memleket/entities/kgd
export const KZ_MCI_2026 = 4_325;

// Minimum wage 2026 (monthly).
export const KZ_MIN_WAGE_MONTHLY_2026 = 85_000;

// Standard tax deduction: 360 MCI per year.
export const KZ_STANDARD_DEDUCTION_2026 = 360 * KZ_MCI_2026;

// Employee mandatory pension (OPC) — 10% of gross.
export const KZ_OPC_EMPLOYEE_RATE = 0.10;

// Employee mandatory health (OMIC) — 2% capped at 20 × minimum wage per month.
export const KZ_OMIC_EMPLOYEE_RATE = 0.02;
export const KZ_OMIC_MONTHLY_BASE_CAP_2026 = 20 * KZ_MIN_WAGE_MONTHLY_2026;

// Individual income tax: 10% up to 8,500 MCI annually; 15% above.
export const KZ_IIT_THRESHOLD_2026 = 8_500 * KZ_MCI_2026;

export const KZ_IIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: KZ_IIT_THRESHOLD_2026, rate: 0.10 },
  { min: KZ_IIT_THRESHOLD_2026, max: Infinity, rate: 0.15 },
];

export const KZ_SOURCE_URLS = {
  governmentPortal: "https://www.gov.kz/",
  pwcKazakhstan: "https://taxsummaries.pwc.com/republic-of-kazakhstan",
} as const;
