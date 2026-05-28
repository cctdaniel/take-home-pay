import type { TaxBracket } from "../../types";

// Israel salary model — tax year 2026 (resident employee).
// Sources:
// - Israel Tax Authority individual tax rates: https://www.gov.il/en/departments/israel_tax_authority

export const IL_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 84_120, rate: 0.1 },
  { min: 84_120, max: 120_720, rate: 0.14 },
  { min: 120_720, max: 193_800, rate: 0.2 },
  { min: 193_800, max: 269_280, rate: 0.31 },
  { min: 269_280, max: 560_280, rate: 0.35 },
  { min: 560_280, max: 721_560, rate: 0.47 },
  { min: 721_560, max: Infinity, rate: 0.5 },
];

export const IL_CREDITS_2026 = {
  baseCreditPoints: 2.25,
  marriedCreditPoints: 0.5,
  childUnder6CreditPoints: 1,
  child6To17CreditPoints: 0.5,
  /** Modeled annual value per credit point (242 NIS/month × 12). */
  annualValuePerPoint: 2_904,
} as const;

export const IL_SOCIAL_2026 = {
  bituachLeumiRate: 0.035,
  bituachLeumiAnnualCap: 49_030 * 12,
  healthInsuranceRate: 0.031,
  mandatoryPensionRate: 0.06,
  pensionAnnualCap: 32_293 * 12,
} as const;

/** Keren Hishtalmut (study fund) — employee contribution up to 7.5% of gross (modeled cap). */
export const IL_STUDY_FUND_MAX_RATE = 0.075;

/** Supplemental pension — reduces Mas Hachnasa up to 5% of gross (additional employee). */
export const IL_SUPPLEMENTAL_PENSION_MAX_RATE = 0.05;

export const IL_SOURCE_URLS = [
  "https://www.gov.il/en/departments/israel_tax_authority",
] as const;

export function calculateIlProgressiveTax(income: number) {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = IL_INCOME_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(taxableIncome, bracket.max) - bracket.min,
    );
    return { ...bracket, tax: taxableAmount * bracket.rate };
  });
  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);
  return {
    totalTax: Math.round(totalTax * 100) / 100,
    bracketTaxes,
  };
}

export function calculateIlCreditPoints(input: {
  isMarried: boolean;
  childrenUnder6: number;
  children6To17: number;
}): number {
  let points = IL_CREDITS_2026.baseCreditPoints;
  if (input.isMarried) {
    points += IL_CREDITS_2026.marriedCreditPoints;
  }
  points +=
    Math.max(0, input.childrenUnder6) * IL_CREDITS_2026.childUnder6CreditPoints;
  points +=
    Math.max(0, input.children6To17) * IL_CREDITS_2026.child6To17CreditPoints;
  return points;
}
