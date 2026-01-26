import { FEDERAL_TAX_BRACKETS, STANDARD_DEDUCTIONS, type FilingStatus, type TaxBracket } from "../constants/tax-brackets-2025";

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
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - standardDeduction);

  const brackets = FEDERAL_TAX_BRACKETS[filingStatus];
  return calculateProgressiveTax(taxableIncome, brackets);
}

export function getFederalTaxableIncome(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus];
  return Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
}
