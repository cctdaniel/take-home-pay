// ============================================================================
// 2026 SINGAPORE CPF (CENTRAL PROVIDENT FUND) RATES
// Source: CPF Board (https://www.cpf.gov.sg)
// Effective: January 2026
// ============================================================================

import type { SGResidencyType } from "../../types";

// ============================================================================
// CPF WAGE CEILING
// ============================================================================
export const CPF_MONTHLY_CEILING = 8000; // SGD - as specified for 2026
export const CPF_ANNUAL_ORDINARY_WAGE_CEILING = 102000; // SGD - Annual OW ceiling

// Additional Wages (AW) ceiling formula: $102,000 - OW subject to CPF for the year
// This ensures total CPF contributions don't exceed the ceiling

// ============================================================================
// CPF CONTRIBUTION RATES BY AGE (CITIZEN/PR)
// These are the employee and employer rates for Singapore Citizens and PRs
// ============================================================================
export interface CPFRates {
  employee: number;
  employer: number;
  total: number;
  // Distribution to accounts (for informational purposes)
  ordinary: number;  // OA allocation rate (of employee contribution)
  special: number;   // SA allocation rate
  medisave: number;  // MA allocation rate
}

// Age bands and their corresponding rates for Citizens/PRs
export const CPF_RATES_CITIZEN_PR: { maxAge: number; rates: CPFRates }[] = [
  {
    maxAge: 55,
    rates: {
      employee: 0.20,
      employer: 0.17,
      total: 0.37,
      ordinary: 0.6217, // 62.17% of 23% total (employer perspective)
      special: 0.1622,
      medisave: 0.2162,
    },
  },
  {
    maxAge: 60,
    rates: {
      employee: 0.15,
      employer: 0.145,
      total: 0.295,
      ordinary: 0.4237,
      special: 0.2373,
      medisave: 0.3390,
    },
  },
  {
    maxAge: 65,
    rates: {
      employee: 0.095,
      employer: 0.105,
      total: 0.20,
      ordinary: 0.2100,
      special: 0.3150,
      medisave: 0.4750,
    },
  },
  {
    maxAge: 70,
    rates: {
      employee: 0.07,
      employer: 0.085,
      total: 0.155,
      ordinary: 0.0645,
      special: 0.2903,
      medisave: 0.6452,
    },
  },
  {
    maxAge: Infinity,
    rates: {
      employee: 0.05,
      employer: 0.075,
      total: 0.125,
      ordinary: 0.08,
      special: 0.08,
      medisave: 0.84,
    },
  },
];

// ============================================================================
// CPF RATES FOR FOREIGNERS
// Foreigners do NOT contribute to CPF
// ============================================================================
export const CPF_RATES_FOREIGNER: CPFRates = {
  employee: 0,
  employer: 0,
  total: 0,
  ordinary: 0,
  special: 0,
  medisave: 0,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get CPF rates based on age and residency type
 */
export function getCPFRates(age: number, residencyType: SGResidencyType): CPFRates {
  if (residencyType === "foreigner") {
    return CPF_RATES_FOREIGNER;
  }

  // Find the applicable rate based on age
  for (const bracket of CPF_RATES_CITIZEN_PR) {
    if (age <= bracket.maxAge) {
      return bracket.rates;
    }
  }

  // Fallback to the last bracket (70+)
  return CPF_RATES_CITIZEN_PR[CPF_RATES_CITIZEN_PR.length - 1].rates;
}

/**
 * Calculate CPF contributions for a given monthly salary
 */
export function calculateMonthlyCPF(
  monthlySalary: number,
  age: number,
  residencyType: SGResidencyType
): {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  ordinaryAccount: number;
  specialAccount: number;
  medisaveAccount: number;
} {
  const rates = getCPFRates(age, residencyType);

  // Apply the monthly ceiling
  const contributableSalary = Math.min(monthlySalary, CPF_MONTHLY_CEILING);

  const employeeContribution = Math.round(contributableSalary * rates.employee * 100) / 100;
  const employerContribution = Math.round(contributableSalary * rates.employer * 100) / 100;
  const totalContribution = employeeContribution + employerContribution;

  // Distribute to accounts (simplified - actual distribution is more complex)
  const ordinaryAccount = Math.round(totalContribution * rates.ordinary * 100) / 100;
  const specialAccount = Math.round(totalContribution * rates.special * 100) / 100;
  const medisaveAccount = totalContribution - ordinaryAccount - specialAccount;

  return {
    employeeContribution,
    employerContribution,
    totalContribution,
    ordinaryAccount,
    specialAccount,
    medisaveAccount,
  };
}

/**
 * Calculate annual CPF contributions
 */
export function calculateAnnualCPF(
  annualSalary: number,
  age: number,
  residencyType: SGResidencyType
): {
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  ordinaryAccount: number;
  specialAccount: number;
  medisaveAccount: number;
} {
  // For simplicity, assume even monthly distribution
  // In reality, CPF has complex rules for OW and AW
  const monthlySalary = annualSalary / 12;
  const monthlyResult = calculateMonthlyCPF(monthlySalary, age, residencyType);

  return {
    employeeContribution: Math.round(monthlyResult.employeeContribution * 12 * 100) / 100,
    employerContribution: Math.round(monthlyResult.employerContribution * 12 * 100) / 100,
    totalContribution: Math.round(monthlyResult.totalContribution * 12 * 100) / 100,
    ordinaryAccount: Math.round(monthlyResult.ordinaryAccount * 12 * 100) / 100,
    specialAccount: Math.round(monthlyResult.specialAccount * 12 * 100) / 100,
    medisaveAccount: Math.round(monthlyResult.medisaveAccount * 12 * 100) / 100,
  };
}

// ============================================================================
// VOLUNTARY CONTRIBUTION LIMITS
// ============================================================================
export const SRS_ANNUAL_LIMIT_CITIZEN_PR = 15300; // SGD - SRS limit for Citizens/PRs
export const SRS_ANNUAL_LIMIT_FOREIGNER = 35700; // SGD - SRS limit for Foreigners

export const CPF_VOLUNTARY_TOPUP_LIMIT = 8000; // SGD - Annual voluntary CPF top-up limit (for tax relief)

export function getSRSLimit(residencyType: SGResidencyType): number {
  return residencyType === "foreigner" ? SRS_ANNUAL_LIMIT_FOREIGNER : SRS_ANNUAL_LIMIT_CITIZEN_PR;
}
