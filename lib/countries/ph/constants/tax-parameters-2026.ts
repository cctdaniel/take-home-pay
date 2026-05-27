export const PH_SOURCE_URLS = {
  birIncomeTax: "https://www.bir.gov.ph/income-tax",
  birWithholdingCalculator: "https://www.bir.gov.ph/wtcalculator",
  birRevenueRegulations292025:
    "https://bir-cdn.bir.gov.ph/BIR/pdf/RR%20No.%2029-2025%20digest%20FINAL.pdf",
  sssContributionTable: "https://www.sss.gov.ph/pay-contribution/",
  sssCircular2024_006:
    "https://www.sss.gov.ph/wp-content/uploads/2024/12/CI-2024-006-Publication.pdf",
  philHealthAdvisory2025:
    "https://www.philhealth.gov.ph/advisories/2025/PA2025-0002.pdf",
  dbmPagIbigCircularLetter:
    "https://www.dbm.gov.ph/wp-content/uploads/Issuances/2024/Circular-Letter/CIRCULAR-LETTER-NO-2024-2-DATED-FEBRUARY-01-2024.pdf",
} as const;

export const PH_13TH_MONTH_AND_OTHER_BENEFITS_EXEMPT_LIMIT = 90_000;
export const PH_NRA_NOT_ENGAGED_TAX_RATE = 0.25;

export const PH_DE_MINIMIS_BENEFIT_LIMITS_2026 = {
  medicalCashAllowance: 2_000 * 2,
  riceSubsidy: 2_500 * 12,
  uniformClothing: 8_000,
  actualMedicalAssistance: 12_000,
  laundryAllowance: 400 * 12,
  achievementAwards: 12_000,
  christmasGifts: 6_000,
  cbaProductivityIncentives: 12_000,
} as const;

// SSS (Social Security System) parameters
export const PH_SSS_2026 = {
  employeeRate: 0.05, // 5% (2025 onwards - increased from 4.5%)
  employerRate: 0.095, // 9.5% (employer share)
  minMsc: 5_000, // Minimum Monthly Salary Credit
  maxMsc: 35_000, // Maximum Monthly Salary Credit (2025 onwards)
} as const;

// PhilHealth parameters
export const PH_PHILHEALTH_2026 = {
  employeeRate: 0.025, // 2.5% (shared equally with employer, so employee half)
  employerRate: 0.025, // 2.5% employer share
  monthlyFloor: 10_000, // Minimum monthly basic salary for computation
  monthlyCeiling: 100_000, // Maximum monthly basic salary for computation (2025 onwards)
} as const;

// Pag-IBIG (Home Development Mutual Fund) parameters
export const PH_PAGIBIG_2026 = {
  lowSalaryEmployeeRate: 0.01, // 1% for monthly compensation of PHP 1,500 and below
  employeeRate: 0.02, // 2% for employees earning > 1,500
  employerRate: 0.02, // 2% employer share
  lowSalaryThreshold: 1_500,
  mfsCeiling: 10_000, // Maximum Monthly Fund Salary effective February 2024
} as const;

// Income tax brackets (TRAIN Law, effective 2023 onwards)
export const PH_TAX_BRACKETS_2026 = [
  { min: 0, max: 250_000, rate: 0 },
  { min: 250_000, max: 400_000, rate: 0.15 },
  { min: 400_000, max: 800_000, rate: 0.20 },
  { min: 800_000, max: 2_000_000, rate: 0.25 },
  { min: 2_000_000, max: 8_000_000, rate: 0.30 },
  { min: 8_000_000, max: Infinity, rate: 0.35 },
] as const;

export function calculatePHProgressiveTax(
  taxableIncome: number
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];

  for (const bracket of PH_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.min) continue;
    const amountInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    if (amountInBracket <= 0) continue;
    const tax = amountInBracket * bracket.rate;
    totalTax += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax * 100) / 100,
    });
  }

  return {
    totalTax: Math.round(totalTax * 100) / 100,
    bracketTaxes,
  };
}
