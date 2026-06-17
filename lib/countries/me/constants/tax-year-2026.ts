import type { TaxBracket } from "../../types";

// Montenegro salary tax parameters — 2026
// Sources: https://www.poreskauprava.gov.me/

export const ME_TAX_YEAR = 2026;

export const ME_SOURCE_URLS = {
  incomeTax: "https://www.poreskauprava.gov.me/",
  socialContributions: "https://www.poreskauprava.gov.me/",
} as const;

/** Employee pension (PIO) contribution rate on insurable base. */
export const ME_PENSION_EMPLOYEE_RATE = 0.1;

/** Employee unemployment insurance rate on gross. */
export const ME_UNEMPLOYMENT_EMPLOYEE_RATE = 0.005;

/** Maximum annual pension contribution base (EUR). */
export const ME_PENSION_ANNUAL_CAP = 68_765;

/** Monthly PIT thresholds (EUR) — applied to monthly income after employee social. */
export const ME_MONTHLY_PIT_THRESHOLD_LOW = 700;
export const ME_MONTHLY_PIT_THRESHOLD_MID = 1_000;
export const ME_MONTHLY_PIT_RATE_MID = 0.09;
export const ME_MONTHLY_PIT_RATE_TOP = 0.15;

/** Reference annual brackets (monthly tariff is authoritative in calculator). */
export const ME_PIT_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 8_400, rate: 0 },
  { min: 8_400, max: 12_000, rate: 0.09 },
  { min: 12_000, max: Infinity, rate: 0.15 },
];
