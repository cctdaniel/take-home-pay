import type { TaxBracket } from "../../types";

// Pakistan FY2026 salary tax parameters
// Sources: https://www.fbr.gov.pk/

export const PK_TAX_YEAR = 2026;

export const PK_SOURCE_URLS = {
  incomeTax:
    "https://www.fbr.gov.pk/income-tax-rates/1141",
} as const;

/** FY2026 annual salary PIT slabs (PKR). */
/** VPS investment eligible for tax credit up to 20% of taxable income. */
export const PK_VPS_INCOME_RATE_CAP = 0.2;

export const PK_PIT_BRACKETS_FY2026: TaxBracket[] = [
  { min: 0, max: 600_000, rate: 0 },
  { min: 600_000, max: 1_200_000, rate: 0.025 },
  { min: 1_200_000, max: 2_200_000, rate: 0.125 },
  { min: 2_200_000, max: 3_200_000, rate: 0.22 },
  { min: 3_200_000, max: 4_100_000, rate: 0.27 },
  { min: 4_100_000, max: Infinity, rate: 0.35 },
];
