import type { TaxBracket } from "../../types";

// South Africa salary model — 2025/26 tax year (1 Mar 2025 – 28 Feb 2026).
// Sources:
// - SARS tax tables: https://www.sars.gov.za/

/** SARS PAYE table slices (taxable income above threshold). */
export const ZA_PAYE_SLICES_2026 = [
  { above: 0, base: 0, rate: 0, threshold: 0 },
  { above: 95_750, base: 0, rate: 0.18, threshold: 95_750 },
  { above: 237_100, base: 42_678, rate: 0.26, threshold: 237_100 },
  { above: 370_500, base: 77_362, rate: 0.31, threshold: 370_500 },
  { above: 512_800, base: 121_475, rate: 0.36, threshold: 512_800 },
  { above: 673_000, base: 179_147, rate: 0.39, threshold: 673_000 },
  { above: 857_900, base: 251_258, rate: 0.41, threshold: 857_900 },
  { above: 1_817_000, base: 644_489, rate: 0.45, threshold: 1_817_000 },
] as const;

export const ZA_REBATES_2026 = {
  primary: 17_235,
} as const;

export const ZA_UIF_2026 = {
  employeeRate: 0.01,
  maximumAnnualContribution: 17_712,
} as const;

export const ZA_RETIREMENT_ANNUITY_2026 = {
  contributionRateLimit: 0.275,
  annualDollarLimit: 350_000,
} as const;

export const ZA_MEDICAL_CREDITS_2026 = {
  mainMemberMonthly: 364,
  additionalDependentMonthly: 246,
} as const;

export const ZA_SOURCE_URLS = ["https://www.sars.gov.za/"] as const;

export function calculateZaPaye(taxableIncome: number): number {
  const income = Math.max(0, taxableIncome);
  let slice: (typeof ZA_PAYE_SLICES_2026)[number] = ZA_PAYE_SLICES_2026[1];
  for (const candidate of ZA_PAYE_SLICES_2026) {
    if (income > candidate.threshold) {
      slice = candidate;
    }
  }
  const taxBeforeRebate =
    slice.base + Math.max(0, income - slice.threshold) * slice.rate;
  return Math.round(
    Math.max(0, taxBeforeRebate - ZA_REBATES_2026.primary) * 100,
  ) / 100;
}

export function calculateZaGrossPaye(taxableIncome: number): number {
  return (
    calculateZaPaye(taxableIncome) + ZA_REBATES_2026.primary
  );
}

export function calculateZaMedicalTaxCredit(input: {
  mainMember: boolean;
  additionalDependents: number;
}): number {
  const months = 12;
  const main = input.mainMember
    ? ZA_MEDICAL_CREDITS_2026.mainMemberMonthly * months
    : 0;
  const dependents =
    Math.max(0, input.additionalDependents) *
    ZA_MEDICAL_CREDITS_2026.additionalDependentMonthly *
    months;
  return Math.round((main + dependents) * 100) / 100;
}

/** Brackets for display in breakdown (approximate marginal bands). */
export const ZA_INCOME_TAX_BRACKETS_DISPLAY_2026: TaxBracket[] = [
  { min: 0, max: 95_750, rate: 0 },
  { min: 95_750, max: 237_100, rate: 0.18 },
  { min: 237_100, max: 370_500, rate: 0.26 },
  { min: 370_500, max: 512_800, rate: 0.31 },
  { min: 512_800, max: 673_000, rate: 0.36 },
  { min: 673_000, max: 857_900, rate: 0.39 },
  { min: 857_900, max: 1_817_000, rate: 0.41 },
  { min: 1_817_000, max: Infinity, rate: 0.45 },
];
