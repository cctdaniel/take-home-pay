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
  employeeRate: 0.02, // 2% for employees earning > 1,500
  employerRate: 0.02, // 2% employer share
  mfsCeiling: 10_000, // Maximum Monthly Fund Salary (currently 5,000 but being raised)
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

export const PH_PERA_ANNUAL_CONTRIBUTION_CAP_2026 = 200_000;
export const PH_PERA_TAX_CREDIT_RATE = 0.05;
export const PH_PERA_MAX_TAX_CREDIT_2026 = 10_000;
export const PH_SOURCE_URLS = {
  pera: "https://www.bsp.gov.ph/Pages/InclusiveFinance/PERA_FAQs_TaxCredit.aspx",
} as const;
