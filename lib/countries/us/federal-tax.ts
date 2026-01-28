// ============================================================================
// US FEDERAL TAX CALCULATIONS
// ============================================================================

import type { TaxBracket, USFilingStatus } from "../types";
import { FEDERAL_TAX_BRACKETS, STANDARD_DEDUCTIONS } from "./constants/tax-brackets-2026";

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return tax;
}

export function calculateFederalIncomeTax(
  grossIncome: number,
  filingStatus: USFilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - standardDeduction);

  const brackets = FEDERAL_TAX_BRACKETS[filingStatus];
  return calculateProgressiveTax(taxableIncome, brackets);
}

export function getFederalTaxableIncome(
  grossIncome: number,
  filingStatus: USFilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  return Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
}

export function getStandardDeduction(filingStatus: USFilingStatus): number {
  return STANDARD_DEDUCTIONS[filingStatus];
}
