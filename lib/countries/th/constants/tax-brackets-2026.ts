// ============================================================================
// 2026 THAILAND PERSONAL INCOME TAX BRACKETS
// Source: Thailand Revenue Department (www.rd.go.th)
// Note: Thailand uses a progressive tax system
// Non-residents are taxed at a flat 15% on employment income or progressive, whichever is higher
// ============================================================================

import type { TaxBracket, THResidencyType, THTaxReliefInputs } from "../../types";

// ============================================================================
// THAILAND RESIDENT TAX BRACKETS (2026)
// Source: Revenue Department, effective for 2026 tax year
// ============================================================================
export const TH_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 150000, rate: 0 },           // First 150,000: 0% (exempt)
  { min: 150000, max: 300000, rate: 0.05 },   // 150,001 - 300,000: 5%
  { min: 300000, max: 500000, rate: 0.10 },   // 300,001 - 500,000: 10%
  { min: 500000, max: 750000, rate: 0.15 },   // 500,001 - 750,000: 15%
  { min: 750000, max: 1000000, rate: 0.20 },  // 750,001 - 1,000,000: 20%
  { min: 1000000, max: 2000000, rate: 0.25 }, // 1,000,001 - 2,000,000: 25%
  { min: 2000000, max: 5000000, rate: 0.30 }, // 2,000,001 - 5,000,000: 30%
  { min: 5000000, max: Infinity, rate: 0.35 }, // Above 5,000,000: 35%
];

// Non-resident flat tax rate on employment income (or progressive, whichever is higher)
export const TH_NON_RESIDENT_FLAT_RATE = 0.15;

// ============================================================================
// STANDARD DEDUCTIONS (2026)
// Source: Revenue Department
// ============================================================================
export const TH_STANDARD_DEDUCTIONS = {
  // Employment income: 50% deduction capped at 100,000 THB
  employmentIncome: {
    rate: 0.50,
    max: 100000,
  },
} as const;

// ============================================================================
// TAX ALLOWANCES (PERSONAL DEDUCTIONS) - 2026
// Source: Revenue Department
// ============================================================================
export const TH_TAX_ALLOWANCES = {
  // Personal allowance for taxpayer
  personalAllowance: 60000,

  // Spouse allowance (if spouse has no income)
  spouseAllowance: 60000,

  // Child allowance (per child)
  childAllowance: 30000,
  // Additional allowance for 2nd+ child born in/after 2018
  childAllowanceExtra: 30000, // Total 60,000 for 2nd child onwards born >= 2018

  // Parent allowance (per parent, age >= 60, income <= 30,000)
  parentAllowance: 30000,

  // Disabled person allowance (per person)
  disabledPersonAllowance: 60000,

  // Prenatal care and childbirth expenses (per pregnancy)
  childbirthExpenseMax: 60000,

  // Life insurance premium (taxpayer, min 10-year policy)
  lifeInsuranceMax: 100000,

  // Life insurance premium for spouse (no income)
  lifeInsuranceSpouseMax: 10000,

  // Health insurance premium (taxpayer)
  healthInsuranceMax: 25000,

  // Health insurance premium for parents
  healthInsuranceParentsMax: 15000,

  // Combined limit for life + health insurance
  insuranceCombinedMax: 100000,

  // Social Security Fund contribution (fully deductible)
  socialSecurityMax: 9000, // 750 THB/month × 12

  // Provident Fund contribution (up to 15% of income, max 500,000)
  providentFundRate: 0.15,
  providentFundMax: 500000,

  // Retirement Mutual Fund (RMF) - up to 30% of income, max 500,000
  rmfRate: 0.30,
  rmfMax: 500000,

  // Super Savings Fund (SSF) - up to 30% of income, max 200,000
  ssfRate: 0.30,
  ssfMax: 200000,

  // Thai ESG Fund - up to 30% of income, max 100,000 (300,000 special period)
  esgRate: 0.30,
  esgMax: 100000,
  esgMaxSpecial: 300000, // For 2024-2026 period

  // Combined limit for all retirement savings (Provident Fund + RMF + SSF + Pension Insurance)
  retirementCombinedMax: 500000,

  // Pension life insurance - up to 15% of income, max 200,000
  pensionInsuranceRate: 0.15,
  pensionInsuranceMax: 200000,

  // National Savings Fund (NSF)
  nationalSavingsFundMax: 30000,

  // Home mortgage interest
  mortgageInterestMax: 100000,

  // Donations to charity (capped at 10% of net income)
  donationRate: 0.10,

  // Donations to political parties
  politicalDonationMax: 10000,

  // Severance pay exemption (upon compulsory dismissal, not retirement)
  severancePayExemptionMax: 600000,

  // Elderly/disabled allowance (taxpayer age >= 65 or disabled)
  elderlyDisabledAllowance: 190000,
} as const;

// ============================================================================
// SOCIAL SECURITY FUND (SSF) RATES - 2026
// Standard rate: 5% of monthly salary, capped at 750 THB/month
// Reduced rate (Oct 2024 - Mar 2025): 3% capped at 450 THB/month (temporary)
// ============================================================================
export const TH_SOCIAL_SECURITY = {
  standardRate: 0.05,
  standardCap: 750, // THB per month
  annualCap: 9000, // 750 × 12
  wageCeiling: 15000, // Wage base for SS calculation
} as const;

// ============================================================================
// PROVIDENT FUND RATES
// Employee contribution: 2-15% of salary (voluntary, employer matches)
// ============================================================================
export const TH_PROVIDENT_FUND = {
  minRate: 0.02,
  maxRate: 0.15,
  taxDeductionMax: 500000,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate Thailand income tax using progressive brackets
 */
export function calculateProgressiveTax(taxableIncome: number): number {
  let tax = 0;

  for (const bracket of TH_TAX_BRACKETS) {
    if (taxableIncome <= bracket.min) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return Math.round(tax);
}

/**
 * Calculate standard deduction for employment income
 */
export function calculateStandardDeduction(income: number): number {
  const calculatedDeduction = income * TH_STANDARD_DEDUCTIONS.employmentIncome.rate;
  return Math.min(calculatedDeduction, TH_STANDARD_DEDUCTIONS.employmentIncome.max);
}

/**
 * Calculate Social Security Fund contribution
 */
export function calculateSocialSecurityContribution(annualSalary: number): number {
  const monthlySalary = annualSalary / 12;
  // SS is calculated on wages up to the ceiling
  const ssWageBase = Math.min(monthlySalary, TH_SOCIAL_SECURITY.wageCeiling);
  const monthlyContribution = Math.min(
    ssWageBase * TH_SOCIAL_SECURITY.standardRate,
    TH_SOCIAL_SECURITY.standardCap
  );
  return Math.round(monthlyContribution * 12);
}

// ============================================================================
// TAX CALCULATION RESULT INTERFACE
// ============================================================================
export interface THTaxResult {
  assessableIncome: number;
  standardDeduction: number;
  netIncome: number;
  totalAllowances: number;
  taxableIncome: number;
  incomeTax: number;
  effectiveTaxRate: number;
  allowances: {
    personalAllowance: number;
    spouseAllowance: number;
    childAllowance: number;
    parentAllowance: number;
    disabledPersonAllowance: number;
    lifeInsurance: number;
    healthInsurance: number;
    socialSecurity: number;
    providentFund: number;
    rmf: number;
    ssf: number;
    esg: number;
    mortgageInterest: number;
    donations: number;
    politicalDonation: number;
    elderlyDisabledAllowance: number;
    nationalSavingsFund: number;
  };
}

// ============================================================================
// MAIN TAX CALCULATION FUNCTION
// ============================================================================
export function calculateTHIncomeTax(
  annualIncome: number,
  residencyType: THResidencyType,
  taxReliefs?: THTaxReliefInputs
): THTaxResult {
  // Calculate standard deduction
  const standardDeduction = calculateStandardDeduction(annualIncome);
  const netIncome = annualIncome - standardDeduction;

  // Calculate allowances based on inputs
  const personalAllowance = TH_TAX_ALLOWANCES.personalAllowance;
  let spouseAllowance = 0;
  let childAllowance = 0;
  let parentAllowance = 0;
  let disabledPersonAllowance = 0;
  let lifeInsurance = 0;
  let healthInsurance = 0;
  let socialSecurity = 0;
  let providentFund = 0;
  let rmf = 0;
  let ssf = 0;
  let esg = 0;
  let mortgageInterest = 0;
  let donations = 0;
  let politicalDonation = 0;
  let elderlyDisabledAllowance = 0;
  let nationalSavingsFund = 0;

  if (taxReliefs) {
    // Spouse allowance (if spouse has no income)
    if (taxReliefs.hasSpouse && taxReliefs.spouseHasNoIncome) {
      spouseAllowance = TH_TAX_ALLOWANCES.spouseAllowance;
    }

    // Child allowance
    if (taxReliefs.numberOfChildren > 0) {
      // First child: 30,000, Additional children born >= 2018: 60,000 each
      // Simplified: assume 30,000 per child for basic calculation
      // In practice, users would specify which children were born >= 2018
      childAllowance = taxReliefs.numberOfChildren * TH_TAX_ALLOWANCES.childAllowance;
      // Add extra allowance for children born >= 2018
      if (taxReliefs.numberOfChildrenBornAfter2018 > 0) {
        childAllowance += taxReliefs.numberOfChildrenBornAfter2018 * TH_TAX_ALLOWANCES.childAllowanceExtra;
      }
    }

    // Parent allowance
    if (taxReliefs.numberOfParents > 0) {
      parentAllowance = taxReliefs.numberOfParents * TH_TAX_ALLOWANCES.parentAllowance;
    }

    // Disabled person allowance
    if (taxReliefs.numberOfDisabledDependents > 0) {
      disabledPersonAllowance = taxReliefs.numberOfDisabledDependents * TH_TAX_ALLOWANCES.disabledPersonAllowance;
    }

    // Life insurance (capped at 100,000)
    if (taxReliefs.lifeInsurancePremium > 0) {
      lifeInsurance = Math.min(taxReliefs.lifeInsurancePremium, TH_TAX_ALLOWANCES.lifeInsuranceMax);
    }

    // Life insurance for spouse
    if (taxReliefs.lifeInsuranceSpousePremium > 0 && spouseAllowance > 0) {
      lifeInsurance += Math.min(taxReliefs.lifeInsuranceSpousePremium, TH_TAX_ALLOWANCES.lifeInsuranceSpouseMax);
    }

    // Health insurance (capped at 25,000 for self, 15,000 for parents)
    if (taxReliefs.healthInsurancePremium > 0) {
      healthInsurance = Math.min(taxReliefs.healthInsurancePremium, TH_TAX_ALLOWANCES.healthInsuranceMax);
    }

    // Health insurance for parents
    if (taxReliefs.healthInsuranceParentsPremium > 0) {
      const parentsInsurance = Math.min(
        taxReliefs.healthInsuranceParentsPremium,
        TH_TAX_ALLOWANCES.healthInsuranceParentsMax
      );
      healthInsurance += parentsInsurance;
    }

    // Combined life + health insurance cap
    const insuranceTotal = lifeInsurance + healthInsurance;
    if (insuranceTotal > TH_TAX_ALLOWANCES.insuranceCombinedMax) {
      // Proportionally reduce both
      const ratio = TH_TAX_ALLOWANCES.insuranceCombinedMax / insuranceTotal;
      lifeInsurance = Math.round(lifeInsurance * ratio);
      healthInsurance = Math.round(healthInsurance * ratio);
    }

    // Social Security contribution (fully deductible)
    if (taxReliefs.hasSocialSecurity) {
      socialSecurity = calculateSocialSecurityContribution(annualIncome);
    }

    // Provident Fund contribution
    if (taxReliefs.providentFundContribution > 0) {
      const maxProvident = Math.min(
        annualIncome * TH_TAX_ALLOWANCES.providentFundRate,
        TH_TAX_ALLOWANCES.providentFundMax
      );
      providentFund = Math.min(taxReliefs.providentFundContribution, maxProvident);
    }

    // Retirement Mutual Fund (RMF)
    if (taxReliefs.rmfContribution > 0) {
      const maxRmf = Math.min(annualIncome * TH_TAX_ALLOWANCES.rmfRate, TH_TAX_ALLOWANCES.rmfMax);
      rmf = Math.min(taxReliefs.rmfContribution, maxRmf);
    }

    // Super Savings Fund (SSF)
    if (taxReliefs.ssfContribution > 0) {
      const maxSsf = Math.min(annualIncome * TH_TAX_ALLOWANCES.ssfRate, TH_TAX_ALLOWANCES.ssfMax);
      ssf = Math.min(taxReliefs.ssfContribution, maxSsf);
    }

    // Thai ESG Fund
    if (taxReliefs.esgContribution > 0) {
      // Check if in special period (2024-2026)
      const isSpecialPeriod = true; // For 2026
      const esgMax = isSpecialPeriod ? TH_TAX_ALLOWANCES.esgMaxSpecial : TH_TAX_ALLOWANCES.esgMax;
      const maxEsg = Math.min(annualIncome * TH_TAX_ALLOWANCES.esgRate, esgMax);
      esg = Math.min(taxReliefs.esgContribution, maxEsg);
    }

    // Combined retirement savings cap
    const retirementTotal = providentFund + rmf + ssf;
    if (retirementTotal > TH_TAX_ALLOWANCES.retirementCombinedMax) {
      const ratio = TH_TAX_ALLOWANCES.retirementCombinedMax / retirementTotal;
      providentFund = Math.round(providentFund * ratio);
      rmf = Math.round(rmf * ratio);
      ssf = Math.round(ssf * ratio);
    }

    // Mortgage interest
    if (taxReliefs.mortgageInterest > 0) {
      mortgageInterest = Math.min(taxReliefs.mortgageInterest, TH_TAX_ALLOWANCES.mortgageInterestMax);
    }

    // Donations (capped at 10% of net income)
    if (taxReliefs.donations > 0) {
      const maxDonation = netIncome * TH_TAX_ALLOWANCES.donationRate;
      donations = Math.min(taxReliefs.donations, maxDonation);
    }

    // Political donations
    if (taxReliefs.politicalDonation > 0) {
      politicalDonation = Math.min(taxReliefs.politicalDonation, TH_TAX_ALLOWANCES.politicalDonationMax);
    }

    // Elderly/disabled taxpayer allowance
    if (taxReliefs.isElderlyOrDisabled) {
      elderlyDisabledAllowance = TH_TAX_ALLOWANCES.elderlyDisabledAllowance;
    }

    // National Savings Fund (NSF) contribution
    if (taxReliefs.nationalSavingsFundContribution > 0) {
      nationalSavingsFund = Math.min(
        taxReliefs.nationalSavingsFundContribution,
        TH_TAX_ALLOWANCES.nationalSavingsFundMax
      );
    }
  }

  // Calculate total allowances
  const totalAllowances =
    personalAllowance +
    spouseAllowance +
    childAllowance +
    parentAllowance +
    disabledPersonAllowance +
    lifeInsurance +
    healthInsurance +
    socialSecurity +
    providentFund +
    rmf +
    ssf +
    esg +
    mortgageInterest +
    donations +
    politicalDonation +
    elderlyDisabledAllowance +
    nationalSavingsFund;

  // Calculate taxable income
  const taxableIncome = Math.max(0, netIncome - totalAllowances);

  // Calculate tax
  let incomeTax: number;
  if (residencyType === "non_resident") {
    // Non-residents: compare progressive vs flat rate (15% on employment income)
    const progressiveTax = calculateProgressiveTax(taxableIncome);
    const flatTax = Math.round(annualIncome * TH_NON_RESIDENT_FLAT_RATE);
    incomeTax = Math.max(progressiveTax, flatTax);
  } else {
    // Residents: use progressive tax
    incomeTax = calculateProgressiveTax(taxableIncome);
  }

  const effectiveTaxRate = annualIncome > 0 ? incomeTax / annualIncome : 0;

  return {
    assessableIncome: annualIncome,
    standardDeduction,
    netIncome,
    totalAllowances,
    taxableIncome,
    incomeTax,
    effectiveTaxRate,
    allowances: {
      personalAllowance,
      spouseAllowance,
      childAllowance,
      parentAllowance,
      disabledPersonAllowance,
      lifeInsurance,
      healthInsurance,
      socialSecurity,
      providentFund,
      rmf,
      ssf,
      esg,
      mortgageInterest,
      donations,
      politicalDonation,
      elderlyDisabledAllowance,
      nationalSavingsFund,
    },
  };
}
