// ============================================================================
// 2026 PAYROLL TAX CONSTANTS
// Source: Social Security Administration (released October 2025)
// ============================================================================

const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 181200; // Up from $176,100 in 2025

const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250000;

import type { FilingStatus } from "../constants/tax-brackets-2025";

export function calculateSocialSecurity(grossIncome: number): number {
  const taxableWages = Math.min(grossIncome, SOCIAL_SECURITY_WAGE_BASE);
  return taxableWages * SOCIAL_SECURITY_RATE;
}

export function calculateMedicare(grossIncome: number): number {
  return grossIncome * MEDICARE_RATE;
}

export function calculateAdditionalMedicare(
  grossIncome: number,
  filingStatus: FilingStatus
): number {
  const threshold = filingStatus === "married_jointly"
    ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED
    : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;

  if (grossIncome <= threshold) return 0;

  return (grossIncome - threshold) * ADDITIONAL_MEDICARE_RATE;
}

export function calculatePayrollTaxes(
  grossIncome: number,
  filingStatus: FilingStatus
): {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
} {
  return {
    socialSecurity: calculateSocialSecurity(grossIncome),
    medicare: calculateMedicare(grossIncome),
    additionalMedicare: calculateAdditionalMedicare(grossIncome, filingStatus),
  };
}

// Export constants for reference
export const PAYROLL_TAX_INFO = {
  socialSecurityRate: SOCIAL_SECURITY_RATE,
  socialSecurityWageBase: SOCIAL_SECURITY_WAGE_BASE,
  medicareRate: MEDICARE_RATE,
  additionalMedicareRate: ADDITIONAL_MEDICARE_RATE,
  additionalMedicareThresholdSingle: ADDITIONAL_MEDICARE_THRESHOLD_SINGLE,
  additionalMedicareThresholdMarried: ADDITIONAL_MEDICARE_THRESHOLD_MARRIED,
};
