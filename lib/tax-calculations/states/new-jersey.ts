import { NEW_JERSEY_TAX_BRACKETS, NJ_PERSONAL_EXEMPTIONS, STATE_DISABILITY_RATES } from "../../constants/state-tax-brackets-2025";
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

export function calculateNewJerseyStateTax(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  // NJ uses personal exemptions instead of standard deduction
  const exemption = NJ_PERSONAL_EXEMPTIONS[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - preTaxDeductions - exemption);
  const brackets = NEW_JERSEY_TAX_BRACKETS[filingStatus];
  return calculateProgressiveTax(taxableIncome, brackets);
}

export function calculateNewJerseySDI(grossIncome: number): number {
  const { rate, wageBase } = STATE_DISABILITY_RATES.NJ;
  const taxableWages = wageBase ? Math.min(grossIncome, wageBase) : grossIncome;
  return taxableWages * rate;
}

export function getNewJerseyTaxableIncome(
  grossIncome: number,
  filingStatus: FilingStatus,
  preTaxDeductions: number = 0
): number {
  const exemption = NJ_PERSONAL_EXEMPTIONS[filingStatus];
  return Math.max(0, grossIncome - preTaxDeductions - exemption);
}

export const newJerseyCalculator: StateCalculator = {
  calculateStateTax: (taxableIncome: number, filingStatus: FilingStatus) => {
    const brackets = NEW_JERSEY_TAX_BRACKETS[filingStatus];
    return calculateProgressiveTax(taxableIncome, brackets);
  },
  calculateSDI: calculateNewJerseySDI,
  getStateName: () => "New Jersey",
};
