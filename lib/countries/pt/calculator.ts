// ============================================================================
// PORTUGAL CALCULATOR IMPLEMENTATION
// Source: Autoridade Tributária e Aduaneira (AT) - Portal das Finanças
// https://www.portaldasfinancas.gov.pt/
//
// IRS 2026 - Imposto sobre o Rendimento das Pessoas Singulares
// Social Security 2026 - Segurança Social
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  PTBreakdown,
  PTCalculatorInputs,
  PTTaxBreakdown,
  RegionInfo,
} from "../types";
import { PT_CONFIG } from "./config";
import {
  calculateIRS,
  calculateSocialSecurity,
  calculateSolidaritySurcharge,
  calculateSpecificDeduction,
  PORTUGAL_SOCIAL_SECURITY_2026,
} from "./constants/tax-brackets-2026";

// ============================================================================
// PPR CONTRIBUTION LIMITS (2026)
// 20% tax credit on contributions, with age-based caps
// ============================================================================
const PPR_LIMITS_2026 = {
  under35: { maxCredit: 400, maxContribution: 2000 }, // 20% of 2000 = 400
  age35to50: { maxCredit: 350, maxContribution: 1750 }, // 20% of 1750 = 350
  over50: { maxCredit: 300, maxContribution: 1500 }, // 20% of 1500 = 300
};

function getPPRLimit(age: number): {
  maxCredit: number;
  maxContribution: number;
} {
  if (age < 35) return PPR_LIMITS_2026.under35;
  if (age <= 50) return PPR_LIMITS_2026.age35to50;
  return PPR_LIMITS_2026.over50;
}

// ============================================================================
// DEPENDENT DEDUCTIONS (2026)
// Deductions from tax assessed (not from income)
// ============================================================================
function calculateDependentDeduction(numberOfDependents: number): number {
  // €600 per dependent (simplified - basic amount)
  // Additional amounts apply for young children but we'll use the base rate
  return numberOfDependents * 600;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

// NHR 2.0 flat tax rate (20% for eligible employment income)
const NHR2_FLAT_RATE = 0.20;

// ============================================================================
// PORTUGAL CALCULATOR
// ============================================================================
export function calculatePT(inputs: PTCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    filingStatus,
    numberOfDependents,
    age,
    contributions,
  } = inputs;

  const isResident = residencyType === "resident" || residencyType === "nhr_2";
  const isNhr2 = residencyType === "nhr_2";

  // Step 1: Calculate Social Security contribution (applies to residents and NHR 2.0)
  const socialSecurity = isResident ? calculateSocialSecurity(grossSalary) : 0;

  // Employer Social Security (informational only)
  const employerSocialSecurity =
    grossSalary * PORTUGAL_SOCIAL_SECURITY_2026.employerRate;

  // Step 2: Calculate specific deduction
  // The deduction is the greater of minimum specific deduction or SS contributions
  // NOTE: NHR 2.0 does NOT apply the specific deduction - 20% flat rate applies to gross
  const specificDeduction = isResident && !isNhr2
    ? calculateSpecificDeduction(grossSalary, socialSecurity)
    : 0;

  // Step 3: Calculate taxable income
  // For standard residents: gross - specific deduction
  // For non-residents: full gross income (flat 25% rate applies)
  // For NHR 2.0: full gross income (20% flat rate applies to gross, no deduction)
  const taxableIncome = isResident && !isNhr2
    ? Math.max(0, grossSalary - specificDeduction)
    : grossSalary;

  // Step 4: Calculate IRS tax
  let incomeTax: number;
  let incomeTaxBeforeJointFiling: number | undefined; // Store original tax for comparison
  let incomeTaxStandardRegime: number | undefined; // For NHR 2.0 comparison
  let bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;

  if (isNhr2) {
    // NHR 2.0: 20% flat rate on employment income
    incomeTax = taxableIncome * NHR2_FLAT_RATE;
    bracketTaxes = [
      {
        min: 0,
        max: Infinity,
        rate: NHR2_FLAT_RATE,
        tax: incomeTax,
      },
    ];
    // Calculate what tax would be under standard regime for comparison
    if (filingStatus === "married_jointly") {
      const halfIncome = taxableIncome / 2;
      const irsResultHalf = calculateIRS(halfIncome);
      incomeTaxStandardRegime = irsResultHalf.totalTax * 2;
    } else {
      const irsResult = calculateIRS(taxableIncome);
      incomeTaxStandardRegime = irsResult.totalTax;
    }
  } else if (isResident) {
    // Residents: progressive tax brackets
    if (filingStatus === "married_jointly") {
      // Joint filing (aggregado): divide income by 2, calculate tax, multiply by 2
      // This usually results in lower tax due to progressive brackets
      const halfIncome = taxableIncome / 2;
      const irsResultHalf = calculateIRS(halfIncome);
      const irsResultFull = calculateIRS(taxableIncome);
      incomeTaxBeforeJointFiling = irsResultFull.totalTax;
      incomeTax = irsResultHalf.totalTax * 2;
      // Scale bracket taxes for display
      bracketTaxes = irsResultHalf.bracketTaxes.map((b) => ({
        ...b,
        tax: b.tax * 2,
      }));
    } else {
      // Separate filing (single or married_separately)
      const irsResult = calculateIRS(taxableIncome);
      incomeTax = irsResult.totalTax;
      bracketTaxes = irsResult.bracketTaxes;
    }
  } else {
    // Non-residents: flat 25% rate
    incomeTax = taxableIncome * 0.25;
    bracketTaxes = [
      {
        min: 0,
        max: Infinity,
        rate: 0.25,
        tax: incomeTax,
      },
    ];
  }

  // Step 5: Calculate solidarity surcharge (for high incomes)
  // Applied to gross income, not taxable income
  // NHR 2.0: Exempt from solidarity surcharge
  const solidaritySurcharge =
    isResident && !isNhr2 && grossSalary > 80000
      ? calculateSolidaritySurcharge(grossSalary)
      : 0;

  // Step 6: Calculate PPR tax credit (20% of contribution, age-based limit)
  // Only residents can claim PPR tax credits - non-residents pay flat 25% rate
  const pprLimit = getPPRLimit(age);
  const pprContribution = isResident
    ? Math.min(contributions?.pprContribution ?? 0, pprLimit.maxContribution)
    : 0;
  const pprTaxCredit = isResident ? pprContribution * 0.2 : 0; // 20% tax credit for residents only

  // Step 7: Calculate dependent deductions (from tax assessed)
  const dependentDeduction = isResident
    ? calculateDependentDeduction(numberOfDependents)
    : 0;

  // Step 8: Calculate final tax after credits and deductions
  // Tax credits (PPR) and deductions (dependents) reduce the tax assessed
  const grossTax = incomeTax + solidaritySurcharge;
  const totalTaxCredits = pprTaxCredit + dependentDeduction;
  const finalTax = Math.max(0, grossTax - totalTaxCredits);

  // Step 9: Build tax breakdown
  const taxes: PTTaxBreakdown = {
    type: "PT",
    totalIncomeTax: finalTax,
    incomeTax,
    solidaritySurcharge,
    socialSecurity,
  };

  // Step 10: Calculate totals
  // Total deductions include: Final IRS tax + Social Security + PPR contribution
  const totalDeductions = finalTax + socialSecurity + pprContribution;
  const netSalary = grossSalary - totalDeductions;
  // Effective tax rate includes income tax + social security (mandatory contributions)
  // PPR contribution is voluntary savings, not a tax, so excluded from this rate
  const effectiveTaxRate = grossSalary > 0 ? (finalTax + socialSecurity) / grossSalary : 0;

  // Effective rates for display
  const effectiveIRSRate = grossSalary > 0 ? incomeTax / grossSalary : 0;
  const effectiveSocialSecurityRate =
    grossSalary > 0 ? socialSecurity / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Step 11: Build detailed breakdown
  const breakdown: PTBreakdown = {
    type: "PT",
    taxableIncome,
    bracketTaxes,
    incomeTax,
    solidaritySurcharge,
    socialSecurity,
    specificDeduction,
    isResident,
    isNhr2,
    filingStatus,
    numberOfDependents,
    employerSocialSecurity,
    effectiveIRSRate,
    effectiveSocialSecurityRate,
    // New fields for tax reliefs
    pprContribution,
    pprTaxCredit,
    pprMaxContribution: pprLimit.maxContribution,
    dependentDeduction,
    totalTaxCredits,
    grossTaxBeforeCredits: grossTax,
    // Joint filing info
    incomeTaxBeforeJointFiling,
    jointFilingSavings: incomeTaxBeforeJointFiling ? incomeTaxBeforeJointFiling - incomeTax : undefined,
    // NHR 2.0 info
    nhr2FlatRate: isNhr2 ? NHR2_FLAT_RATE : undefined,
    nhr2TaxSavings: isNhr2 && incomeTaxStandardRegime ? incomeTaxStandardRegime - finalTax : undefined,
  };

  return {
    country: "PT",
    currency: "EUR",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax: finalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

// ============================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ============================================================================
export const PTCalculator: CountryCalculator = {
  countryCode: "PT",
  config: PT_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PT") {
      throw new Error("PTCalculator can only calculate PT inputs");
    }
    return calculatePT(inputs as PTCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    // Portugal has no regional tax subdivisions
    return [];
  },

  getContributionLimits(
    inputs?: Partial<PTCalculatorInputs>,
  ): ContributionLimits {
    const age = inputs?.age ?? 30;
    const limit = getPPRLimit(age);
    return {
      ppr: {
        limit: limit.maxContribution,
        name: "PPR Contribution",
        description: `Retirement Savings Plan - 20% tax credit up to €${limit.maxCredit}`,
        preTax: false, // Tax credit, not pre-tax deduction
      },
    };
  },

  getDefaultInputs(): PTCalculatorInputs {
    return {
      country: "PT",
      grossSalary: 35000, // €35,000 - typical Portuguese salary
      payFrequency: "monthly",
      residencyType: "resident",
      filingStatus: "single",
      numberOfDependents: 0,
      age: 30,
      contributions: {
        pprContribution: 0,
      },
    };
  },
};
