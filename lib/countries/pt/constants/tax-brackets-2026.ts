// ============================================================================
// PORTUGAL IRS TAX BRACKETS (2026)
// Source: Autoridade Tributária e Aduaneira (AT) - Portal das Finanças
// https://www.portaldasfinancas.gov.pt/
//
// IRS 2026 - Progressive tax brackets for employment income
// Social Security contributions: 11% (employee share)
// Solidarity surcharge for high incomes
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// IRS TAX BRACKETS 2026
// Imposto sobre o Rendimento das Pessoas Singulares
// ============================================================================
export const PORTUGAL_IRS_BRACKETS_2026: TaxBracket[] = [
  {
    min: 0,
    max: 7703,
    rate: 0.13, // 13%
  },
  {
    min: 7703,
    max: 11623,
    rate: 0.165, // 16.5%
  },
  {
    min: 11623,
    max: 16472,
    rate: 0.22, // 22%
  },
  {
    min: 16472,
    max: 21321,
    rate: 0.25, // 25%
  },
  {
    min: 21321,
    max: 27146,
    rate: 0.32, // 32%
  },
  {
    min: 27146,
    max: 39791,
    rate: 0.355, // 35.5%
  },
  {
    min: 39791,
    max: 43081,
    rate: 0.435, // 43.5%
  },
  {
    min: 43081,
    max: 58528,
    rate: 0.45, // 45%
  },
  {
    min: 58528,
    max: Infinity,
    rate: 0.48, // 48%
  },
];

// ============================================================================
// SOLIDARITY SURCHARGE (Adicional de Solidariedade)
// Applied to high incomes in addition to IRS
// ============================================================================
export const PORTUGAL_SOLIDARITY_SURCHARGE_2026 = {
  threshold1: 80000, // First threshold
  threshold2: 250000, // Second threshold
  rate1: 0.025, // 2.5% for income between €80,000 and €250,000
  rate2: 0.05, // 5% for income above €250,000
};

// ============================================================================
// SOCIAL SECURITY (Segurança Social)
// Employee contribution rates
// ============================================================================
export const PORTUGAL_SOCIAL_SECURITY_2026 = {
  employeeRate: 0.11, // 11% - employee share
  employerRate: 0.2375, // 23.75% - employer share (informational)
  // No income ceiling for Social Security in Portugal (unlike some countries)
};

// ============================================================================
// TAX DEDUCTIONS (Deduções à coleta)
// Minimum specific deductions for employment income
// ============================================================================
export const PORTUGAL_SPECIFIC_DEDUCTIONS_2026 = {
  // Minimum specific deduction for employment income (Dedução específica mínima)
  // Artigo 25.º do CIRS
  minimumSpecificDeduction: 4104, // €4,104 minimum for employment income

  // Alternatively: €0 if using itemized deductions, or actual social security contributions
  // plus other specific expenses (health, education, etc.)
};

// ============================================================================
// TAX CREDITS (Créditos de imposto)
// ============================================================================
export const PORTUGAL_TAX_CREDITS_2026 = {
  // No automatic tax credits in Portugal
  // Credits are based on actual expenses incurred
  // (health, education, housing, etc.)
};

// ============================================================================
// NON-RESIDENT TAX RATE
// ============================================================================
export const PORTUGAL_NON_RESIDENT_RATE_2026 = 0.25; // 25% flat rate for non-residents

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate progressive IRS tax using tax brackets
 */
export function calculateIRS(income: number): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  const bracketTaxes = PORTUGAL_IRS_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min
    );
    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

/**
 * Calculate solidarity surcharge for high incomes
 */
export function calculateSolidaritySurcharge(income: number): number {
  const { threshold1, threshold2, rate1, rate2 } =
    PORTUGAL_SOLIDARITY_SURCHARGE_2026;

  let surcharge = 0;

  // 2.5% on income between €80,000 and €250,000
  if (income > threshold1) {
    const taxableAtRate1 = Math.min(income, threshold2) - threshold1;
    surcharge += taxableAtRate1 * rate1;
  }

  // 5% on income above €250,000
  if (income > threshold2) {
    const taxableAtRate2 = income - threshold2;
    surcharge += taxableAtRate2 * rate2;
  }

  return Math.max(0, surcharge);
}

/**
 * Calculate Social Security contribution
 */
export function calculateSocialSecurity(grossIncome: number): number {
  return grossIncome * PORTUGAL_SOCIAL_SECURITY_2026.employeeRate;
}

/**
 * Calculate minimum specific deduction for employment income
 * This is the minimum amount that can be deducted from gross income
 * before applying tax rates
 */
export function calculateSpecificDeduction(
  grossIncome: number,
  socialSecurityContribution: number
): number {
  // The deduction is the greater of:
  // 1. Minimum specific deduction (€4,104 for 2026)
  // 2. Social security contributions paid
  return Math.max(
    PORTUGAL_SPECIFIC_DEDUCTIONS_2026.minimumSpecificDeduction,
    socialSecurityContribution
  );
}
