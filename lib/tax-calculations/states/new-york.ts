import { NEW_YORK_TAX_BRACKETS, NY_STANDARD_DEDUCTIONS, NY_ADDITIONAL_TAXES } from "../../constants/state-tax-brackets-2025";
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

export function calculateNewYorkStateTax(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = NY_STANDARD_DEDUCTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
  const brackets = NEW_YORK_TAX_BRACKETS[filingStatus];
  return calculateProgressiveTax(taxableIncome, brackets);
}

export function calculateNewYorkSDI(grossIncome: number): number {
  // NY SDI is minimal - max $0.60/week or ~$31.20/year
  return Math.min(grossIncome * NY_ADDITIONAL_TAXES.sdiRate, NY_ADDITIONAL_TAXES.sdiMaxAnnual);
}

export function calculateNewYorkPFL(grossIncome: number): number {
  // Paid Family Leave
  const taxableWages = Math.min(grossIncome, NY_ADDITIONAL_TAXES.pflWageBase);
  return taxableWages * NY_ADDITIONAL_TAXES.pflRate;
}

export function getNewYorkTaxableIncome(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const standardDeduction = NY_STANDARD_DEDUCTIONS[filingStatus];
  return Math.max(0, grossIncome - preTaxDeductions - standardDeduction);
}

export const newYorkCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = NEW_YORK_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: (grossIncome: number) => {
    // Combined SDI + PFL
    return calculateNewYorkSDI(grossIncome) + calculateNewYorkPFL(grossIncome);
  },
  getStateName: () => "New York",
};
