// ==========================================================================
// UNITED KINGDOM TAX CONSTANTS (TAX YEAR 2026/27)
// Tax Year: 6 April 2026 to 5 April 2027
//
// Official Sources:
// - HMRC Rates and Thresholds for Employers 2026/27:
//   https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// - GOV.UK Income Tax Rates:
//   https://www.gov.uk/income-tax-rates
// - Scottish Income Tax:
//   https://www.gov.uk/scottish-income-tax
//
// Note: For 2026/27, UK income tax thresholds remain frozen at 2025/26 levels
// per government policy announced in previous budgets.
// ==========================================================================

import type { TaxBracket } from "../../types";

// Tax year label for UI copy
export const UK_TAX_YEAR_LABEL = "2026/27";

// ==========================================================================
// PERSONAL ALLOWANCE (PA)
// Source: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
// ==========================================================================
export const UK_PERSONAL_ALLOWANCE = 12570; // £12,570 per year
export const UK_PERSONAL_ALLOWANCE_TAPER_THRESHOLD = 100000; // Allowance reduces above £100,000
export const UK_PERSONAL_ALLOWANCE_ZERO_AT = 125140; // Allowance is zero above £125,140

// ==========================================================================
// INCOME TAX BANDS - ENGLAND, WALES, NORTHERN IRELAND
// Source: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
//
// Taxable income above Personal Allowance
// Basic rate: 20% on £0 to £37,700
// Higher rate: 40% on £37,701 to £125,140
// Additional rate: 45% above £125,140
// ==========================================================================
export const UK_INCOME_TAX_BANDS_RUK: TaxBracket[] = [
  { min: 0, max: 37700, rate: 0.2 },      // Basic rate: 20%
  { min: 37700, max: 125140, rate: 0.4 }, // Higher rate: 40%
  { min: 125140, max: Infinity, rate: 0.45 }, // Additional rate: 45%
];

// ==========================================================================
// SCOTTISH INCOME TAX BANDS
// Source: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
//
// Taxable income above Personal Allowance
// Starter rate: 19% on up to £3,967
// Basic rate: 20% on £3,968 to £16,956
// Intermediate rate: 21% on £16,957 to £31,092
// Higher rate: 42% on £31,093 to £62,430
// Advanced rate: 45% on £62,431 to £125,140
// Top rate: 48% above £125,140
// ==========================================================================
export const UK_INCOME_TAX_BANDS_SCOTLAND: TaxBracket[] = [
  { min: 0, max: 3967, rate: 0.19 },        // Starter rate: 19%
  { min: 3967, max: 16956, rate: 0.2 },     // Basic rate: 20%
  { min: 16956, max: 31092, rate: 0.21 },   // Intermediate rate: 21%
  { min: 31092, max: 62430, rate: 0.42 },   // Higher rate: 42%
  { min: 62430, max: 125140, rate: 0.45 },  // Advanced rate: 45%
  { min: 125140, max: Infinity, rate: 0.48 }, // Top rate: 48%
];

// ==========================================================================
// CLASS 1 NATIONAL INSURANCE - EMPLOYEE (Category A - Standard)
// Source: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
//
// Primary Threshold (PT): £12,570/year - start paying NI
// Upper Earnings Limit (UEL): £50,270/year
// Lower Earnings Limit (LEL): £6,708/year - for benefit entitlement only
//
// Rates:
// - 0% on earnings below PT
// - 8% on earnings between PT and UEL
// - 2% on earnings above UEL
// ==========================================================================
export const UK_NI_THRESHOLDS_2026_27 = {
  lowerEarningsLimit: 6708,    // £129/week = £6,708/year
  primaryThreshold: 12570,     // £242/week = £12,570/year
  upperEarningsLimit: 50270,   // £967/week = £50,270/year
} as const;

export const UK_NI_RATES_2026_27 = {
  mainRate: 0.08,      // 8% on earnings between PT and UEL
  additionalRate: 0.02, // 2% on earnings above UEL
} as const;

// ==========================================================================
// PENSION CONTRIBUTION LIMITS
// Source: https://www.gov.uk/tax-on-your-private-pension/annual-allowance
// ==========================================================================
export const UK_PENSION_ANNUAL_ALLOWANCE = 60000; // £60,000 annual allowance
export const UK_PENSION_MINIMUM_ANNUAL_ALLOWANCE = 10000; // Reduces to £10,000 for high earners
export const UK_PENSION_TAPER_THRESHOLD = 260000; // Threshold income for taper
export const UK_PENSION_ADJUSTED_INCOME_THRESHOLD = 200000; // Adjusted income for taper

// ==========================================================================
// HELPER FUNCTIONS
// ==========================================================================

/**
 * Round to pence (2 decimal places) for UK currency
 */
export function roundToPence(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate Personal Allowance with taper for high earners
 * 
 * The Personal Allowance goes down by £1 for every £2 of income above £100,000.
 * This means the allowance is zero when income reaches £125,140.
 * 
 * @param adjustedNetIncome - Total income subject to tax
 * @param isResident - Whether the taxpayer is UK resident
 * @returns Object containing the allowance amount and reduction amount
 */
export function calculatePersonalAllowance(
  adjustedNetIncome: number,
  isResident: boolean,
): { allowance: number; reduction: number } {
  // Non-residents don't get a Personal Allowance
  if (!isResident) {
    return { allowance: 0, reduction: 0 };
  }

  // Below taper threshold - full allowance
  if (adjustedNetIncome <= UK_PERSONAL_ALLOWANCE_TAPER_THRESHOLD) {
    return { allowance: UK_PERSONAL_ALLOWANCE, reduction: 0 };
  }

  // Above zero threshold - no allowance
  if (adjustedNetIncome >= UK_PERSONAL_ALLOWANCE_ZERO_AT) {
    return { allowance: 0, reduction: UK_PERSONAL_ALLOWANCE };
  }

  // Taper zone: reduce by £1 for every £2 above £100,000
  const reduction = (adjustedNetIncome - UK_PERSONAL_ALLOWANCE_TAPER_THRESHOLD) / 2;
  const allowance = Math.max(0, UK_PERSONAL_ALLOWANCE - reduction);

  return {
    allowance: roundToPence(allowance),
    reduction: roundToPence(Math.min(reduction, UK_PERSONAL_ALLOWANCE)),
  };
}

/**
 * Calculate progressive income tax using tax brackets
 * 
 * @param income - Taxable income (after Personal Allowance)
 * @param brackets - Array of tax brackets
 * @returns Object containing total tax and breakdown by bracket
 */
export function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[],
): {
  totalTax: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
} {
  const bracketTaxes = brackets.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min,
    );
    return {
      ...bracket,
      tax: roundToPence(taxableAmount * bracket.rate),
    };
  }).filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  const totalTax = roundToPence(
    bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0),
  );

  return { totalTax, bracketTaxes };
}

/**
 * Calculate Class 1 National Insurance contributions for employees
 * 
 * Uses Category A (standard employee) rates:
 * - 0% on earnings below Primary Threshold (£12,570)
 * - 8% on earnings between Primary Threshold and Upper Earnings Limit (£12,570 - £50,270)
 * - 2% on earnings above Upper Earnings Limit
 * 
 * @param annualIncome - Gross annual income
 * @returns Object containing main contribution, additional contribution, and total
 */
export function calculateNationalInsurance(annualIncome: number): {
  mainContribution: number;
  additionalContribution: number;
  total: number;
} {
  const { primaryThreshold, upperEarningsLimit } = UK_NI_THRESHOLDS_2026_27;

  // Calculate taxable amounts in each band
  const mainBand = Math.max(
    0,
    Math.min(annualIncome, upperEarningsLimit) - primaryThreshold,
  );
  const additionalBand = Math.max(0, annualIncome - upperEarningsLimit);

  // Calculate contributions
  const mainContribution = roundToPence(
    mainBand * UK_NI_RATES_2026_27.mainRate,
  );
  const additionalContribution = roundToPence(
    additionalBand * UK_NI_RATES_2026_27.additionalRate,
  );

  return {
    mainContribution,
    additionalContribution,
    total: roundToPence(mainContribution + additionalContribution),
  };
}

/**
 * Calculate pension tax relief
 * 
 * For workplace pensions, tax relief is typically given at source:
 * - Basic rate relief (20%) is automatically added by the pension provider
 * - Higher/additional rate taxpayers can claim additional relief through tax return
 * 
 * This function calculates the effective tax relief based on income tax band.
 * 
 * @param grossContribution - Gross pension contribution (before tax relief)
 * @param taxableIncome - Taxable income after Personal Allowance
 * @param isHigherRateTaxpayer - Whether taxpayer pays higher or additional rate
 * @returns Object containing tax relief amounts
 */
export function calculatePensionTaxRelief(
  grossContribution: number,
  taxableIncome: number,
  isHigherRateTaxpayer: boolean,
): {
  basicRateRelief: number;  // 20% automatically applied
  higherRateRelief: number; // Additional 20% or 25% claimable
  totalRelief: number;
} {
  // Basic rate relief is 20% of the gross contribution
  // If employee contributes £80, HMRC adds £20, gross contribution = £100
  // So basic relief = 20% of gross = £20
  const basicRateRelief = roundToPence(grossContribution * 0.2);

  // Higher rate taxpayers can claim additional relief
  // Higher rate (40%) - already got 20%, can claim another 20%
  // Additional rate (45%) - already got 20%, can claim another 25%
  let higherRateRelief = 0;
  if (isHigherRateTaxpayer) {
    // Determine if additional rate taxpayer (taxable income > £125,140)
    const isAdditionalRateTaxpayer = taxableIncome > 125140;
    const additionalRate = isAdditionalRateTaxpayer ? 0.25 : 0.2;
    higherRateRelief = roundToPence(grossContribution * additionalRate);
  }

  return {
    basicRateRelief,
    higherRateRelief,
    totalRelief: roundToPence(basicRateRelief + higherRateRelief),
  };
}
