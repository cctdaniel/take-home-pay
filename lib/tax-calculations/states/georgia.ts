import { GEORGIA_TAX_BRACKETS, GA_STANDARD_DEDUCTIONS } from "../../constants/state-tax-brackets-2025";
import type { FilingStatus, TaxBracket } from "../../constants/tax-brackets-2025";
import type { StateCalculator } from "../types";

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

export function calculateGeorgiaStateTax(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = GA_STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
  const brackets = GEORGIA_TAX_BRACKETS[filingStatus];
  return calculateProgressiveTax(taxableIncome, brackets);
}

export function getGeorgiaTaxableIncome(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = GA_STANDARD_DEDUCTIONS[filingStatus];
  return Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
}

export const georgiaCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = GEORGIA_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: () => 0, // Georgia has no SDI
  getStateName: () => "Georgia",
};
