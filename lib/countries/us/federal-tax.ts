// ============================================================================
// US FEDERAL TAX CALCULATIONS
// ============================================================================

import type { TaxBracket, USFilingStatus } from "../types";
import { FEDERAL_TAX_BRACKETS, STANDARD_DEDUCTIONS } from "./constants/tax-brackets-2026";

// Rev. Proc. 2025-32 sets the 2026 child tax credit maximum at $2,200.
// The $500 credit for other dependents remains under IRC section 24(h)(4).
const CHILD_TAX_CREDIT_2026 = 2200;
const OTHER_DEPENDENT_CREDIT = 500;
const CREDIT_PHASEOUT_SINGLE = 200000;
const CREDIT_PHASEOUT_MARRIED_JOINTLY = 400000;
const CREDIT_PHASEOUT_INCREMENT = 1000;
const CREDIT_PHASEOUT_REDUCTION_PER_INCREMENT = 50;

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

function getDependentCreditPhaseoutThreshold(
  filingStatus: USFilingStatus,
): number {
  return filingStatus === "married_jointly"
    ? CREDIT_PHASEOUT_MARRIED_JOINTLY
    : CREDIT_PHASEOUT_SINGLE;
}

export function calculateUSDependentCredits({
  adjustedGrossIncome,
  filingStatus,
  numberOfQualifyingChildren,
  numberOfOtherDependents,
  federalTaxBeforeCredits,
}: {
  adjustedGrossIncome: number;
  filingStatus: USFilingStatus;
  numberOfQualifyingChildren: number;
  numberOfOtherDependents: number;
  federalTaxBeforeCredits: number;
}) {
  const childTaxCredit =
    Math.max(0, Math.floor(numberOfQualifyingChildren)) *
    CHILD_TAX_CREDIT_2026;
  const otherDependentCredit =
    Math.max(0, Math.floor(numberOfOtherDependents)) *
    OTHER_DEPENDENT_CREDIT;
  const totalPotentialCredit = childTaxCredit + otherDependentCredit;
  const phaseoutThreshold = getDependentCreditPhaseoutThreshold(filingStatus);
  const phaseoutReduction =
    adjustedGrossIncome > phaseoutThreshold
      ? Math.ceil(
          (adjustedGrossIncome - phaseoutThreshold) /
            CREDIT_PHASEOUT_INCREMENT,
        ) * CREDIT_PHASEOUT_REDUCTION_PER_INCREMENT
      : 0;
  const totalCreditAfterPhaseout = Math.max(
    0,
    totalPotentialCredit - phaseoutReduction,
  );
  const totalCreditsApplied = Math.min(
    federalTaxBeforeCredits,
    totalCreditAfterPhaseout,
  );

  return {
    childTaxCredit: Math.min(childTaxCredit, totalCreditsApplied),
    otherDependentCredit: Math.max(
      0,
      totalCreditsApplied - Math.min(childTaxCredit, totalCreditsApplied),
    ),
    phaseoutReduction: Math.min(phaseoutReduction, totalPotentialCredit),
    totalCreditsApplied,
  };
}
