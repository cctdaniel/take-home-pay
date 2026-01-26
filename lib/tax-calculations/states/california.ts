import { CALIFORNIA_TAX_BRACKETS, CA_STANDARD_DEDUCTIONS, type FilingStatus, type TaxBracket } from "../../constants/tax-brackets-2025";
import type { StateCalculator } from "../types";

// California SDI rate for 2025
const CA_SDI_RATE = 0.012;

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;

  for (const bracket of brackets) {
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return tax;
}

export function calculateCaliforniaStateTax(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = CA_STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - standardDeduction);

  const brackets = CALIFORNIA_TAX_BRACKETS[filingStatus];
  return calculateProgressiveTax(taxableIncome, brackets);
}

export function calculateCaliforniaSDI(grossIncome: number): number {
  // California SDI has no wage cap as of 2024
  return grossIncome * CA_SDI_RATE;
}

export function getCaliforniaTaxableIncome(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = CA_STANDARD_DEDUCTIONS[filingStatus];
  return Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
}

export const californiaCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = CALIFORNIA_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: calculateCaliforniaSDI,
  getStateName: () => "California",
};
