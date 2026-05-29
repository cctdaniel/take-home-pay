// Social insurance contribution rates (employee portion)
export const VN_SOCIAL_INSURANCE_2026 = {
  socialInsuranceRate: 0.08, // 8% (BHXH - social insurance)
  healthInsuranceRate: 0.015, // 1.5% (BHYT - health insurance)
  unemploymentInsuranceRate: 0.01, // 1% (BHTN - unemployment insurance)
  totalRate: 0.105, // Total employee contribution: 10.5%
  // Ceiling: 20x base salary (base salary = 2,340,000 VND as of July 2024)
  baseSalary: 2_340_000, // Statutory base salary
  ceilingMultiplier: 20, // 20x statutory base salary
  regionalMinimumWageTier1: 4_960_000, // Highest region (Region I)
} as const;

// Personal tax deduction
export const VN_PERSONAL_DEDUCTION_MONTHLY = 11_000_000; // 11M VND/month
export const VN_PERSONAL_DEDUCTION_ANNUAL = 132_000_000; // 132M VND/year

// Dependent deduction per dependent per month
export const VN_DEPENDENT_DEDUCTION_MONTHLY = 4_400_000; // 4.4M VND/month/dependent
export const VN_DEPENDENT_DEDUCTION_ANNUAL = 52_800_000; // 52.8M VND/year/dependent

// Personal income tax brackets (7 brackets, progressive)
export const VN_TAX_BRACKETS_2026 = [
  { min: 0, max: 60_000_000, rate: 0.05 },
  { min: 60_000_000, max: 120_000_000, rate: 0.10 },
  { min: 120_000_000, max: 216_000_000, rate: 0.15 },
  { min: 216_000_000, max: 384_000_000, rate: 0.20 },
  { min: 384_000_000, max: 624_000_000, rate: 0.25 },
  { min: 624_000_000, max: 960_000_000, rate: 0.30 },
  { min: 960_000_000, max: Infinity, rate: 0.35 },
] as const;

export function calculateVNProgressiveTax(
  annualTaxableIncome: number
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

  for (const bracket of VN_TAX_BRACKETS_2026) {
    if (annualTaxableIncome <= bracket.min) continue;
    const amountInBracket =
      Math.min(annualTaxableIncome, bracket.max) - bracket.min;
    if (amountInBracket <= 0) continue;
    const tax = amountInBracket * bracket.rate;
    totalTax += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax),
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}

export const VN_VOLUNTARY_PENSION_ANNUAL_CAP_2026 = 12_000_000;
export const VN_SOURCE_URLS = {
  voluntaryPension: "https://thuvienphapluat.vn/van-ban/Thuong-mai/Thong-tu-111-2013-TT-BTC-cua-Bo-Tai-chinh-huong-dan-thi-hanh-Luat-thue-TNDN-218/201170/tu-van.aspx",
} as const;
