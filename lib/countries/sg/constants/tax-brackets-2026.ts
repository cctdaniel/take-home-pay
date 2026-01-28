// ============================================================================
// 2026 SINGAPORE INCOME TAX BRACKETS
// Source: Inland Revenue Authority of Singapore (IRAS)
// Note: Singapore uses a progressive tax system
// Non-residents are taxed at a flat 24% (or progressive, whichever is higher)
// ============================================================================

import type { TaxBracket, SGResidencyType } from "../../types";

// ============================================================================
// SINGAPORE RESIDENT TAX BRACKETS (2026)
// Tax is calculated on chargeable income (after reliefs and deductions)
// ============================================================================
export const SG_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 20000, rate: 0 },            // First $20,000: 0%
  { min: 20000, max: 30000, rate: 0.02 },     // Next $10,000: 2%
  { min: 30000, max: 40000, rate: 0.035 },    // Next $10,000: 3.5%
  { min: 40000, max: 80000, rate: 0.07 },     // Next $40,000: 7%
  { min: 80000, max: 120000, rate: 0.115 },   // Next $40,000: 11.5%
  { min: 120000, max: 160000, rate: 0.15 },   // Next $40,000: 15%
  { min: 160000, max: 200000, rate: 0.18 },   // Next $40,000: 18%
  { min: 200000, max: 240000, rate: 0.19 },   // Next $40,000: 19%
  { min: 240000, max: 280000, rate: 0.195 },  // Next $40,000: 19.5%
  { min: 280000, max: 320000, rate: 0.20 },   // Next $40,000: 20%
  { min: 320000, max: 500000, rate: 0.22 },   // Next $180,000: 22%
  { min: 500000, max: 1000000, rate: 0.23 },  // Next $500,000: 23%
  { min: 1000000, max: Infinity, rate: 0.24 }, // Above $1,000,000: 24%
];

// Non-resident flat tax rate (or progressive, whichever is higher)
export const SG_NON_RESIDENT_FLAT_RATE = 0.24;

// ============================================================================
// TAX RELIEFS AND DEDUCTIONS (2026)
// ============================================================================
export const SG_TAX_RELIEFS = {
  // Earned Income Relief
  earnedIncomeReliefBelow55: 1000,
  earnedIncomeRelief55to59: 6000,
  earnedIncomeRelief60andAbove: 8000,

  // CPF Relief (capped at actual CPF contributions)
  cpfReliefCap: 37740, // Maximum CPF OA relief (based on OW ceiling * 37%)

  // Personal Relief (for specific qualifications)
  handicappedBrother: 5500,
  handicappedSister: 5500,

  // Life Insurance Relief (cap)
  lifeInsuranceReliefCap: 5000,

  // Course Fees Relief
  courseFeesReliefCap: 5500,

  // SRS Relief (full amount contributed is tax deductible)
  srsReliefCitizen: 15300,
  srsReliefForeigner: 35700,

  // Voluntary CPF Top-up Relief
  voluntaryCpfTopUpReliefCap: 8000,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Singapore income tax using progressive brackets
 */
export function calculateProgressiveTax(chargeableIncome: number): number {
  let tax = 0;

  for (const bracket of SG_TAX_BRACKETS) {
    if (chargeableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(chargeableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return Math.round(tax * 100) / 100;
}

/**
 * Calculate earned income relief based on age
 */
export function getEarnedIncomeRelief(age: number): number {
  if (age >= 60) return SG_TAX_RELIEFS.earnedIncomeRelief60andAbove;
  if (age >= 55) return SG_TAX_RELIEFS.earnedIncomeRelief55to59;
  return SG_TAX_RELIEFS.earnedIncomeReliefBelow55;
}

/**
 * Calculate Singapore income tax
 * For foreigners (non-residents), use flat rate or progressive, whichever is higher
 */
export function calculateSGIncomeTax(
  annualIncome: number,
  cpfEmployeeContribution: number,
  srsContribution: number,
  voluntaryCpfTopUp: number,
  age: number,
  residencyType: SGResidencyType
): {
  chargeableIncome: number;
  incomeTax: number;
  effectiveTaxRate: number;
} {
  // Calculate total reliefs/deductions
  const earnedIncomeRelief = getEarnedIncomeRelief(age);
  const cpfRelief = Math.min(cpfEmployeeContribution, SG_TAX_RELIEFS.cpfReliefCap);
  const srsRelief = residencyType === "foreigner"
    ? Math.min(srsContribution, SG_TAX_RELIEFS.srsReliefForeigner)
    : Math.min(srsContribution, SG_TAX_RELIEFS.srsReliefCitizen);
  const cpfTopUpRelief = Math.min(voluntaryCpfTopUp, SG_TAX_RELIEFS.voluntaryCpfTopUpReliefCap);

  const totalReliefs = earnedIncomeRelief + cpfRelief + srsRelief + cpfTopUpRelief;

  // Calculate chargeable income
  const chargeableIncome = Math.max(0, annualIncome - totalReliefs);

  // Calculate tax
  let incomeTax: number;

  if (residencyType === "foreigner") {
    // For non-residents, compare progressive vs flat rate
    const progressiveTax = calculateProgressiveTax(chargeableIncome);
    const flatTax = Math.round(annualIncome * SG_NON_RESIDENT_FLAT_RATE * 100) / 100;
    // Use the higher of the two (this is IRAS rule for non-residents)
    incomeTax = Math.max(progressiveTax, flatTax);
  } else {
    // For citizens/PRs, use progressive tax
    incomeTax = calculateProgressiveTax(chargeableIncome);
  }

  const effectiveTaxRate = annualIncome > 0 ? incomeTax / annualIncome : 0;

  return {
    chargeableIncome,
    incomeTax,
    effectiveTaxRate,
  };
}
