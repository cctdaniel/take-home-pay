// EPF (Employee Provident Fund) parameters
export const IN_EPF_2026 = {
  employeeRate: 0.12, // 12% of basic + DA
  employerRate: 0.12, // 12% (8.33% to EPS, 3.67% to EPF)
  monthlyWageCeiling: 15_000, // Statutory ceiling (higher for voluntary)
} as const;

// New Tax Regime slabs (default for FY 2025-26 / AY 2026-27)
// Income tax slabs under section 115BAC
export const IN_TAX_SLABS_NEW_REGIME_2026 = [
  { min: 0, max: 400_000, rate: 0 },
  { min: 400_000, max: 800_000, rate: 0.05 },
  { min: 800_000, max: 1_200_000, rate: 0.10 },
  { min: 1_200_000, max: 1_600_000, rate: 0.15 },
  { min: 1_600_000, max: 2_000_000, rate: 0.20 },
  { min: 2_000_000, max: 2_400_000, rate: 0.25 },
  { min: 2_400_000, max: Infinity, rate: 0.30 },
] as const;

// Old Tax Regime slabs (for reference)
export const IN_TAX_SLABS_OLD_REGIME_2026 = [
  { min: 0, max: 250_000, rate: 0 },
  { min: 250_000, max: 500_000, rate: 0.05 },
  { min: 500_000, max: 1_000_000, rate: 0.20 },
  { min: 1_000_000, max: Infinity, rate: 0.30 },
] as const;

// Standard deduction for salaried individuals
export const IN_STANDARD_DEDUCTION_NEW_REGIME = 75_000;
export const IN_STANDARD_DEDUCTION_OLD_REGIME = 50_000;

// Section 87A rebate: up to 60,000 (tax rebate, not deduction)
// Available only if total income <= 1,200,000 (new regime) or 500,000 (old regime)
export const IN_REBATE_87A = {
  maxRebateNew: 60_000, // New regime
  maxRebateOld: 12_500, // Old regime
  incomeLimitNew: 1_200_000,
  incomeLimitOld: 500_000,
} as const;

// Health & Education Cess: 4% on (income tax + surcharge)
export const IN_CESS_RATE = 0.04;

// Surcharge rates (on income tax, before cess)
export const IN_SURCHARGE_RATES = [
  { min: 0, max: 5_000_000, rate: 0 },
  { min: 5_000_000, max: 10_000_000, rate: 0.10 },
  { min: 10_000_000, max: 20_000_000, rate: 0.15 },
  { min: 20_000_000, max: 50_000_000, rate: 0.25 },
  { min: 50_000_000, max: Infinity, rate: 0.25 }, // 37% surcharge removed, cap at 25%
] as const;

export function calculateINProgressiveTax(
  taxableIncome: number,
  regime: "new" | "old"
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  const slabs =
    regime === "new"
      ? IN_TAX_SLABS_NEW_REGIME_2026
      : IN_TAX_SLABS_OLD_REGIME_2026;
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];

  for (const slab of slabs) {
    if (taxableIncome <= slab.min) continue;
    const amountInSlab = Math.min(taxableIncome, slab.max) - slab.min;
    if (amountInSlab <= 0) continue;
    const tax = amountInSlab * slab.rate;
    totalTax += tax;
    bracketTaxes.push({
      min: slab.min,
      max: slab.max,
      rate: slab.rate,
      tax: Math.round(tax),
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}

export function calculateINSurcharge(
  totalIncome: number,
  incomeTax: number
): number {
  for (let i = IN_SURCHARGE_RATES.length - 1; i >= 0; i--) {
    if (totalIncome > IN_SURCHARGE_RATES[i].min) {
      return Math.round(incomeTax * IN_SURCHARGE_RATES[i].rate);
    }
  }
  return 0;
}

export function calculateINRebate(
  totalIncome: number,
  taxBeforeRebate: number,
  regime: "new" | "old"
): number {
  const incomeLimit =
    regime === "new"
      ? IN_REBATE_87A.incomeLimitNew
      : IN_REBATE_87A.incomeLimitOld;
  const maxRebate =
    regime === "new"
      ? IN_REBATE_87A.maxRebateNew
      : IN_REBATE_87A.maxRebateOld;

  if (totalIncome <= incomeLimit) {
    return Math.min(taxBeforeRebate, maxRebate);
  }
  return 0;
}

export const IN_NPS_80CCD1B_ANNUAL_CAP_2026 = 50_000;
export const IN_SOURCE_URLS = {
  nps80ccd1b: "https://www.incometax.gov.in/",
} as const;
