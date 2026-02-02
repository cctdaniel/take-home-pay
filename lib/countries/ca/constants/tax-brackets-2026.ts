// ============================================================================
// CANADA TAX BRACKETS AND RATES (2026)
// ============================================================================
// Sources:
// - Federal: CRA T4127 Payroll Deductions Formulas (122nd Edition)
//   https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html
// - CPP: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html
// - EI: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html
// - Provincial: Various provincial finance ministry publications
// ============================================================================

import type { TaxBracket } from "../../types";

// ============================================================================
// FEDERAL TAX BRACKETS 2026
// Note: Lowest rate reduced from 15% to 14% starting in 2026
// ============================================================================
export const CA_FEDERAL_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 58_523, rate: 0.14 }, // 14% (reduced from 15%)
  { min: 58_523, max: 117_045, rate: 0.205 }, // 20.5%
  { min: 117_045, max: 181_440, rate: 0.26 }, // 26%
  { min: 181_440, max: 258_482, rate: 0.29 }, // 29%
  { min: 258_482, max: Infinity, rate: 0.33 }, // 33%
];

// ============================================================================
// FEDERAL BASIC PERSONAL AMOUNT 2026
// Graduated based on income
// ============================================================================
export const CA_FEDERAL_BPA_2026 = {
  maxBPA: 16_452, // For income <= $181,440
  minBPA: 14_829, // For income >= $258,482
  phaseOutStart: 181_440,
  phaseOutEnd: 258_482,
  phaseOutRange: 77_042, // $258,482 - $181,440
  reductionAmount: 1_623, // $16,452 - $14,829
};

// Calculate federal Basic Personal Amount based on income
export function calculateFederalBPA(taxableIncome: number): number {
  const { maxBPA, minBPA, phaseOutStart, phaseOutEnd, phaseOutRange, reductionAmount } =
    CA_FEDERAL_BPA_2026;

  if (taxableIncome <= phaseOutStart) {
    return maxBPA;
  }

  if (taxableIncome >= phaseOutEnd) {
    return minBPA;
  }

  // Linear reduction between phaseOutStart and phaseOutEnd
  const reduction = ((taxableIncome - phaseOutStart) / phaseOutRange) * reductionAmount;
  return maxBPA - reduction;
}

// ============================================================================
// CPP (CANADA PENSION PLAN) CONTRIBUTIONS 2026
// ============================================================================
export const CA_CPP_2026 = {
  // Basic amounts
  basicExemption: 3_500, // Year's Basic Exemption (YBE)
  maxPensionableEarnings: 74_600, // YMPE (Year's Maximum Pensionable Earnings)
  
  // Contribution rate (includes 1% first additional enhancement)
  contributionRate: 0.0595, // 5.95% for employees/employers
  selfEmployedRate: 0.119, // 11.9% for self-employed
  
  // Maximum contributions
  maxEmployeeContribution: 4_230.45,
  maxSelfEmployedContribution: 8_460.90,
};

// Calculate CPP base contribution
export function calculateCPP(grossIncome: number): {
  pensionableEarnings: number;
  contributoryEarnings: number;
  contribution: number;
  maxReached: boolean;
} {
  const { basicExemption, maxPensionableEarnings, contributionRate, maxEmployeeContribution } =
    CA_CPP_2026;

  // Pensionable earnings capped at YMPE
  const pensionableEarnings = Math.min(grossIncome, maxPensionableEarnings);
  
  // Contributory earnings = pensionable earnings minus basic exemption
  // Note: Basic exemption is prorated if earnings < YMPE, but for simplicity
  // we apply it only if pensionable earnings > basic exemption
  const contributoryEarnings = Math.max(0, pensionableEarnings - basicExemption);
  
  // Calculate contribution
  let contribution = contributoryEarnings * contributionRate;
  contribution = Math.min(contribution, maxEmployeeContribution);
  
  return {
    pensionableEarnings,
    contributoryEarnings,
    contribution,
    maxReached: contributoryEarnings >= (maxPensionableEarnings - basicExemption),
  };
}

// ============================================================================
// CPP2 (SECOND ADDITIONAL CPP) 2026
// Applies to earnings between YMPE and YAMPE
// ============================================================================
export const CA_CPP2_2026 = {
  ympe: 74_600, // First earnings ceiling
  yampe: 85_000, // Year's Additional Maximum Pensionable Earnings
  contributionRate: 0.04, // 4% for employees/employers
  selfEmployedRate: 0.08, // 8% for self-employed
  maxEmployeeContribution: 416.00,
  maxSelfEmployedContribution: 832.00,
};

// Calculate CPP2 contribution
export function calculateCPP2(grossIncome: number): {
  additionalPensionableEarnings: number;
  contribution: number;
  maxReached: boolean;
} {
  const { ympe, yampe, contributionRate, maxEmployeeContribution } = CA_CPP2_2026;

  if (grossIncome <= ympe) {
    return {
      additionalPensionableEarnings: 0,
      contribution: 0,
      maxReached: false,
    };
  }

  // CPP2 applies to earnings between YMPE and YAMPE
  const additionalPensionableEarnings = Math.min(grossIncome, yampe) - ympe;
  let contribution = additionalPensionableEarnings * contributionRate;
  contribution = Math.min(contribution, maxEmployeeContribution);

  return {
    additionalPensionableEarnings,
    contribution,
    maxReached: grossIncome >= yampe,
  };
}

// ============================================================================
// EI (EMPLOYMENT INSURANCE) PREMIUMS 2026
// ============================================================================
export const CA_EI_2026 = {
  maxInsurableEarnings: 68_900,
  employeeRate: 0.0163, // 1.63% (outside Quebec)
  quebecRate: 0.013, // 1.30% (Quebec - reduced due to QPIP)
  employerMultiplier: 1.4, // Employer pays 1.4x employee premium
  maxEmployeePremium: 1_123.07, // Outside Quebec
  maxQuebecPremium: 895.70, // Quebec
};

// Calculate EI premium
export function calculateEI(grossIncome: number, isQuebec: boolean = false): {
  insurableEarnings: number;
  premium: number;
  maxReached: boolean;
} {
  const { maxInsurableEarnings, employeeRate, quebecRate, maxEmployeePremium, maxQuebecPremium } =
    CA_EI_2026;

  const insurableEarnings = Math.min(grossIncome, maxInsurableEarnings);
  const rate = isQuebec ? quebecRate : employeeRate;
  const maxPremium = isQuebec ? maxQuebecPremium : maxEmployeePremium;

  let premium = insurableEarnings * rate;
  premium = Math.min(premium, maxPremium);

  return {
    insurableEarnings,
    premium,
    maxReached: grossIncome >= maxInsurableEarnings,
  };
}

// ============================================================================
// QPIP (QUEBEC PARENTAL INSURANCE PLAN) 2026
// ============================================================================
export const CA_QPIP_2026 = {
  maxInsurableEarnings: 68_900, // Same as EI MIE
  employeeRate: 0.0043, // 0.43%
  employerRate: 0.00602, // ~0.602% (1.4x approx, but employer pays separately)
  maxEmployeePremium: 442.90,
};

// Calculate QPIP premium (Quebec only)
export function calculateQPIP(grossIncome: number): {
  insurableEarnings: number;
  premium: number;
  maxReached: boolean;
} {
  const { maxInsurableEarnings, employeeRate, maxEmployeePremium } = CA_QPIP_2026;

  const insurableEarnings = Math.min(grossIncome, maxInsurableEarnings);
  let premium = insurableEarnings * employeeRate;
  premium = Math.min(premium, maxEmployeePremium);

  return {
    insurableEarnings,
    premium,
    maxReached: grossIncome >= maxInsurableEarnings,
  };
}

// ============================================================================
// PROVINCIAL/TERRITORIAL TAX BRACKETS 2026
// ============================================================================

// Alberta (AB) - https://www.kwbllp.com/2025/12/02/2026-canadian-and-albertan-tax-brackets-and-rates/
export const CA_AB_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 61_200, rate: 0.08 }, // 8%
  { min: 61_200, max: 154_259, rate: 0.10 }, // 10%
  { min: 154_259, max: 185_111, rate: 0.12 }, // 12%
  { min: 185_111, max: 246_813, rate: 0.13 }, // 13%
  { min: 246_813, max: 370_220, rate: 0.14 }, // 14%
  { min: 370_220, max: Infinity, rate: 0.15 }, // 15%
];

export const CA_AB_BPA_2026 = 15_935; // Approximate - indexed

// British Columbia (BC) - https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal/tax-rates
export const CA_BC_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 50_363, rate: 0.0506 }, // 5.06%
  { min: 50_363, max: 100_728, rate: 0.077 }, // 7.70%
  { min: 100_728, max: 115_648, rate: 0.105 }, // 10.50%
  { min: 115_648, max: 140_430, rate: 0.1229 }, // 12.29%
  { min: 140_430, max: 190_405, rate: 0.147 }, // 14.70%
  { min: 190_405, max: 265_545, rate: 0.168 }, // 16.80%
  { min: 265_545, max: Infinity, rate: 0.205 }, // 20.50%
];

export const CA_BC_BPA_2026 = 12_958; // Approximate - indexed

// Manitoba (MB)
export const CA_MB_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 47_000, rate: 0.108 }, // 10.8%
  { min: 47_000, max: 100_000, rate: 0.1275 }, // 12.75%
  { min: 100_000, max: Infinity, rate: 0.174 }, // 17.4%
];

export const CA_MB_BPA_2026 = 15_780; // Not indexed for 2026

// New Brunswick (NB)
export const CA_NB_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 51_306, rate: 0.094 }, // 9.4%
  { min: 51_306, max: 102_614, rate: 0.14 }, // 14%
  { min: 102_614, max: 166_280, rate: 0.16 }, // 16%
  { min: 166_280, max: Infinity, rate: 0.195 }, // 19.5%
];

export const CA_NB_BPA_2026 = 13_999; // Approximate

// Newfoundland and Labrador (NL)
export const CA_NL_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 44_288, rate: 0.087 }, // 8.7%
  { min: 44_288, max: 88_576, rate: 0.145 }, // 14.5%
  { min: 88_576, max: 157_280, rate: 0.158 }, // 15.8%
  { min: 157_280, max: 220_000, rate: 0.178 }, // 17.8%
  { min: 220_000, max: Infinity, rate: 0.198 }, // 19.8%
];

export const CA_NL_BPA_2026 = 11_151; // Approximate

// Nova Scotia (NS)
export const CA_NS_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 30_507, rate: 0.0879 }, // 8.79%
  { min: 30_507, max: 61_015, rate: 0.1495 }, // 14.95%
  { min: 61_015, max: 95_883, rate: 0.1667 }, // 16.67%
  { min: 95_883, max: 154_650, rate: 0.175 }, // 17.5%
  { min: 154_650, max: Infinity, rate: 0.21 }, // 21%
];

export const CA_NS_BPA_2026 = 8_744; // Not indexed

// Northwest Territories (NT)
export const CA_NT_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 51_533, rate: 0.059 }, // 5.9%
  { min: 51_533, max: 103_070, rate: 0.086 }, // 8.6%
  { min: 103_070, max: 168_326, rate: 0.122 }, // 12.2%
  { min: 168_326, max: Infinity, rate: 0.1405 }, // 14.05%
];

export const CA_NT_BPA_2026 = 17_093; // Approximate

// Nunavut (NU)
export const CA_NU_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 54_707, rate: 0.04 }, // 4%
  { min: 54_707, max: 109_415, rate: 0.07 }, // 7%
  { min: 109_415, max: 177_881, rate: 0.09 }, // 9%
  { min: 177_881, max: Infinity, rate: 0.115 }, // 11.5%
];

export const CA_NU_BPA_2026 = 18_767; // Approximate

// Ontario (ON) - https://www.taxtips.ca/taxrates/on.htm
export const CA_ON_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 53_891, rate: 0.0505 }, // 5.05%
  { min: 53_891, max: 107_785, rate: 0.0915 }, // 9.15%
  { min: 107_785, max: 150_000, rate: 0.1116 }, // 11.16%
  { min: 150_000, max: 220_000, rate: 0.1216 }, // 12.16%
  { min: 220_000, max: Infinity, rate: 0.1316 }, // 13.16%
];

export const CA_ON_BPA_2026 = 12_989;

// Ontario Surtax thresholds and rates
export const CA_ON_SURTAX_2026 = {
  threshold1: 5_818, // 20% surtax on Ontario tax above this amount
  threshold2: 7_446, // Additional 36% surtax (56% total) on Ontario tax above this amount
  rate1: 0.20,
  rate2: 0.36,
};

// Calculate Ontario surtax
export function calculateOntarioSurtax(ontarioTax: number): number {
  const { threshold1, threshold2, rate1, rate2 } = CA_ON_SURTAX_2026;
  
  let surtax = 0;
  
  if (ontarioTax > threshold2) {
    // Full surtax applies
    surtax = (ontarioTax - threshold2) * (rate1 + rate2);
    surtax += (threshold2 - threshold1) * rate1;
  } else if (ontarioTax > threshold1) {
    // Only first level surtax applies
    surtax = (ontarioTax - threshold1) * rate1;
  }
  
  return surtax;
}

// Prince Edward Island (PE)
export const CA_PE_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 33_328, rate: 0.0965 }, // 9.65%
  { min: 33_328, max: 64_656, rate: 0.137 }, // 13.7%
  { min: 64_656, max: Infinity, rate: 0.167 }, // 16.7%
];

export const CA_PE_BPA_2026 = 13_500; // Approximate

// Quebec (QC) - https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/income-tax-rates/
export const CA_QC_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 54_345, rate: 0.14 }, // 14%
  { min: 54_345, max: 108_680, rate: 0.19 }, // 19%
  { min: 108_680, max: 132_245, rate: 0.24 }, // 24%
  { min: 132_245, max: Infinity, rate: 0.2575 }, // 25.75%
];

export const CA_QC_BPA_2026 = 18_952;

// Saskatchewan (SK)
export const CA_SK_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 57_917, rate: 0.105 }, // 10.5%
  { min: 57_917, max: 165_057, rate: 0.125 }, // 12.5%
  { min: 165_057, max: Infinity, rate: 0.145 }, // 14.5%
];

export const CA_SK_BPA_2026 = 20_381; // Includes $500 increase from SK Affordability Act

// Yukon (YT)
export const CA_YT_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 58_523, rate: 0.064 }, // 6.4% (matches federal 14% reduction)
  { min: 58_523, max: 117_045, rate: 0.09 }, // 9%
  { min: 117_045, max: 181_440, rate: 0.109 }, // 10.9%
  { min: 181_440, max: 258_482, rate: 0.12 }, // 12%
  { min: 258_482, max: Infinity, rate: 0.127 }, // 12.7%
];

export const CA_YT_BPA_2026 = 16_452; // Matches federal

// ============================================================================
// PROVINCIAL/TERRITORIAL INFORMATION MAP
// ============================================================================
export const CA_REGIONS: Record<
  string,
  {
    name: string;
    code: string;
    brackets: TaxBracket[];
    bpa: number;
    isQuebec: boolean;
  }
> = {
  AB: { name: "Alberta", code: "AB", brackets: CA_AB_TAX_BRACKETS_2026, bpa: CA_AB_BPA_2026, isQuebec: false },
  BC: { name: "British Columbia", code: "BC", brackets: CA_BC_TAX_BRACKETS_2026, bpa: CA_BC_BPA_2026, isQuebec: false },
  MB: { name: "Manitoba", code: "MB", brackets: CA_MB_TAX_BRACKETS_2026, bpa: CA_MB_BPA_2026, isQuebec: false },
  NB: { name: "New Brunswick", code: "NB", brackets: CA_NB_TAX_BRACKETS_2026, bpa: CA_NB_BPA_2026, isQuebec: false },
  NL: { name: "Newfoundland and Labrador", code: "NL", brackets: CA_NL_TAX_BRACKETS_2026, bpa: CA_NL_BPA_2026, isQuebec: false },
  NS: { name: "Nova Scotia", code: "NS", brackets: CA_NS_TAX_BRACKETS_2026, bpa: CA_NS_BPA_2026, isQuebec: false },
  NT: { name: "Northwest Territories", code: "NT", brackets: CA_NT_TAX_BRACKETS_2026, bpa: CA_NT_BPA_2026, isQuebec: false },
  NU: { name: "Nunavut", code: "NU", brackets: CA_NU_TAX_BRACKETS_2026, bpa: CA_NU_BPA_2026, isQuebec: false },
  ON: { name: "Ontario", code: "ON", brackets: CA_ON_TAX_BRACKETS_2026, bpa: CA_ON_BPA_2026, isQuebec: false },
  PE: { name: "Prince Edward Island", code: "PE", brackets: CA_PE_TAX_BRACKETS_2026, bpa: CA_PE_BPA_2026, isQuebec: false },
  QC: { name: "Quebec", code: "QC", brackets: CA_QC_TAX_BRACKETS_2026, bpa: CA_QC_BPA_2026, isQuebec: true },
  SK: { name: "Saskatchewan", code: "SK", brackets: CA_SK_TAX_BRACKETS_2026, bpa: CA_SK_BPA_2026, isQuebec: false },
  YT: { name: "Yukon", code: "YT", brackets: CA_YT_TAX_BRACKETS_2026, bpa: CA_YT_BPA_2026, isQuebec: false },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate progressive tax using tax brackets
 */
export function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[],
): {
  totalTax: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
} {
  const bracketTaxes = brackets
    .map((bracket) => {
      const taxableAmount = Math.max(0, Math.min(income, bracket.max) - bracket.min);
      return {
        ...bracket,
        tax: taxableAmount * bracket.rate,
      };
    })
    .filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

// RRSP contribution limit for 2026
export const CA_RRSP_LIMIT_2026 = {
  limit: 32_490, // 2026 RRSP contribution limit
  // Note: Actual room is 18% of previous year's earned income up to limit
  deductionRate: 0.18,
};
