import type { TaxBracket } from "../../types";

// Switzerland salary model — tax year 2026 (federal DBG 2025 tariff + canton multipliers).
// Sources:
// - ESTV federal direct tax tariffs: https://www.estv.admin.ch/estv/en/home/direct-federal-tax.html
// - AHV/IV/EO/ALV contribution rates: https://www.ahv-iv.ch/

export type SwitzerlandCantonCode = "ZH" | "GE" | "ZG" | "VD" | "BS";

export type CHFilingStatus = "single" | "married";

export const CH_CANTONS: Array<{
  code: SwitzerlandCantonCode;
  name: string;
  /** Multiplier applied to modeled federal tax to approximate canton + municipal burden vs Zürich baseline. */
  totalTaxMultiplier: number;
}> = [
  { code: "ZH", name: "Zürich", totalTaxMultiplier: 2.0 },
  { code: "GE", name: "Geneva", totalTaxMultiplier: 2.35 },
  { code: "ZG", name: "Zug", totalTaxMultiplier: 1.65 },
  { code: "VD", name: "Vaud", totalTaxMultiplier: 2.1 },
  { code: "BS", name: "Basel-Stadt", totalTaxMultiplier: 2.2 },
];

/** Federal DBG 2025 tariff — single person annual slices (marginal rates). */
export const CH_FEDERAL_TAX_BRACKETS_SINGLE_2025: TaxBracket[] = [
  { min: 0, max: 14_500, rate: 0 },
  { min: 14_500, max: 31_600, rate: 0.0077 },
  { min: 31_600, max: 41_400, rate: 0.0088 },
  { min: 41_400, max: 55_200, rate: 0.0264 },
  { min: 55_200, max: 72_500, rate: 0.0297 },
  { min: 72_500, max: 78_100, rate: 0.0594 },
  { min: 78_100, max: 103_600, rate: 0.066 },
  { min: 103_600, max: 134_600, rate: 0.088 },
  { min: 134_600, max: 176_000, rate: 0.11 },
  { min: 176_000, max: 755_200, rate: 0.132 },
  { min: 755_200, max: Infinity, rate: 0.115 },
];

/** Pillar 3a — deductible private pension (ESTV 2026 employee max, rounded). */
export const CH_PILLAR_3A_LIMIT_2026 = 7_056;

export const CH_SOCIAL_2026 = {
  ahvIvEoEmployeeRate: 0.053,
  alvEmployeeRateBelowCeiling: 0.011,
  alvEmployeeRateAboveCeiling: 0.005,
  annualSalaryCeiling: 148_200,
} as const;

export const CH_SOURCE_URLS = [
  "https://www.estv.admin.ch/estv/en/home/direct-federal-tax.html",
  "https://www.ahv-iv.ch/",
] as const;

export function calculateChProgressiveTax(
  income: number,
  brackets: TaxBracket[],
): { totalTax: number; bracketTaxes: Array<TaxBracket & { tax: number }> } {
  const taxableIncome = Math.max(0, income);
  let totalTax = 0;
  const bracketTaxes = brackets.map((bracket) => {
    const taxableAtBracket = Math.max(
      0,
      Math.min(taxableIncome, bracket.max) - bracket.min,
    );
    const tax = Math.round(taxableAtBracket * bracket.rate * 100) / 100;
    totalTax += tax;
    return { ...bracket, tax };
  });
  return {
    totalTax: Math.round(totalTax * 100) / 100,
    bracketTaxes,
  };
}

export function calculateChFederalIncomeTax(
  taxableIncome: number,
  filingStatus: CHFilingStatus,
): number {
  if (filingStatus === "married") {
    const halfIncome = taxableIncome / 2;
    const { totalTax } = calculateChProgressiveTax(
      halfIncome,
      CH_FEDERAL_TAX_BRACKETS_SINGLE_2025,
    );
    return Math.round(totalTax * 2 * 100) / 100;
  }
  return calculateChProgressiveTax(
    taxableIncome,
    CH_FEDERAL_TAX_BRACKETS_SINGLE_2025,
  ).totalTax;
}

export function calculateChSocialContributions(grossSalary: number) {
  const salary = Math.max(0, grossSalary);
  const cappedSalary = Math.min(salary, CH_SOCIAL_2026.annualSalaryCeiling);
  const aboveCeiling = Math.max(0, salary - CH_SOCIAL_2026.annualSalaryCeiling);
  const ahvIvEo = Math.round(cappedSalary * CH_SOCIAL_2026.ahvIvEoEmployeeRate * 100) / 100;
  const alv =
    Math.round(cappedSalary * CH_SOCIAL_2026.alvEmployeeRateBelowCeiling * 100) / 100 +
    Math.round(aboveCeiling * CH_SOCIAL_2026.alvEmployeeRateAboveCeiling * 100) / 100;
  return {
    ahvIvEo,
    alv,
    total: Math.round((ahvIvEo + alv) * 100) / 100,
    cappedSalary,
    aboveCeiling,
  };
}
