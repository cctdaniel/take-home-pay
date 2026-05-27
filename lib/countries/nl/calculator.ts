// ============================================================================
// NETHERLANDS CALCULATOR IMPLEMENTATION
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  NLBreakdown,
  NLCalculatorInputs,
  NLIackEligibility,
  NLTaxBreakdown,
  NLThirtyPercentRulingType,
  PayFrequency,
  RegionInfo,
} from "../types";
import { NL_CONFIG } from "./config";
import {
  NL_LIJFRENTE_2026,
  NETHERLANDS_TAX_BRACKETS_2026,
  NL_INCOME_TAX_RATES_2026,
  NL_SOCIAL_SECURITY_RATES_2026,
  NL_THIRTY_PERCENT_RULING_2026,
} from "./constants/tax-brackets-2026";
import {
  calculateGeneralTaxCredit,
  calculateIACK,
  calculateLaborTaxCredit,
} from "./constants/tax-credits-2026";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
const NL_DEFAULT_SALARY = 55000;

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

/**
 * Calculate combined progressive tax (for backwards compat / UI bracket display)
 */
function calculateProgressiveTax(income: number) {
  const bracketTaxes = NETHERLANDS_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min,
    );
    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

/**
 * Calculate social security (volksverzekeringen) separately
 * Social security is capped at the first bracket threshold (€38,883)
 */
function calculateSocialSecurity(taxableIncome: number) {
  const { aow, anw, wlz, ceiling } = NL_SOCIAL_SECURITY_RATES_2026;

  // Social security only applies up to the ceiling
  const taxableForSocialSecurity = Math.min(taxableIncome, ceiling);

  const aowTax = taxableForSocialSecurity * aow;
  const anwTax = taxableForSocialSecurity * anw;
  const wlzTax = taxableForSocialSecurity * wlz;
  const total = aowTax + anwTax + wlzTax;

  return {
    aow: aowTax,
    anw: anwTax,
    wlz: wlzTax,
    total,
    ceiling,
    taxableForSocialSecurity,
  };
}

/**
 * Calculate pure income tax (inkomstenbelasting) separately
 * Bracket 1: 8.10% (combined 35.75% minus 27.65% social security)
 * Bracket 2: 37.56% (pure income tax, no social security)
 * Bracket 3: 49.50% (pure income tax, no social security)
 */
function calculateIncomeTax(taxableIncome: number) {
  const { bracket1Rate, bracket2Rate, bracket3Rate } = NL_INCOME_TAX_RATES_2026;
  const bracket1Limit = 38883;
  const bracket2Limit = 78426;

  // Bracket 1: up to €38,883
  const bracket1Taxable = Math.min(taxableIncome, bracket1Limit);
  const bracket1Tax = bracket1Taxable * bracket1Rate;

  // Bracket 2: €38,883 to €78,426
  const bracket2Taxable = Math.max(
    0,
    Math.min(taxableIncome, bracket2Limit) - bracket1Limit,
  );
  const bracket2Tax = bracket2Taxable * bracket2Rate;

  // Bracket 3: above €78,426
  const bracket3Taxable = Math.max(0, taxableIncome - bracket2Limit);
  const bracket3Tax = bracket3Taxable * bracket3Rate;

  const total = bracket1Tax + bracket2Tax + bracket3Tax;

  return {
    bracket1Tax,
    bracket2Tax,
    bracket3Tax,
    total,
  };
}

function normalizeRulingType(
  inputs: NLCalculatorInputs,
): NLThirtyPercentRulingType {
  if (inputs.thirtyPercentRulingType && inputs.thirtyPercentRulingType !== "none") {
    return inputs.thirtyPercentRulingType;
  }

  return inputs.hasThirtyPercentRuling ? "standard" : "none";
}

function getThirtyPercentSalaryNorm(
  rulingType: NLThirtyPercentRulingType,
): number | null {
  switch (rulingType) {
    case "standard":
      return NL_THIRTY_PERCENT_RULING_2026.standardSalaryNorm;
    case "under30Masters":
      return NL_THIRTY_PERCENT_RULING_2026.under30MastersSalaryNorm;
    case "researcherNoSalaryNorm":
    case "none":
      return null;
  }
}

function calculateThirtyPercentAllowance(
  grossSalary: number,
  rulingType: NLThirtyPercentRulingType,
) {
  if (rulingType === "none") {
    return {
      taxExemptAllowance: 0,
      salaryNorm: null,
      maxAllowance: NL_THIRTY_PERCENT_RULING_2026.maxTaxFreeAllowance,
    };
  }

  const salaryNorm = getThirtyPercentSalaryNorm(rulingType);
  const rateLimit = grossSalary * NL_THIRTY_PERCENT_RULING_2026.exemptionRate;
  const salaryNormLimit =
    salaryNorm === null ? rateLimit : Math.max(0, grossSalary - salaryNorm);

  return {
    taxExemptAllowance: Math.min(
      rateLimit,
      salaryNormLimit,
      NL_THIRTY_PERCENT_RULING_2026.maxTaxFreeAllowance,
    ),
    salaryNorm,
    maxAllowance: NL_THIRTY_PERCENT_RULING_2026.maxTaxFreeAllowance,
  };
}

function normalizeIackEligibility(inputs: NLCalculatorInputs): NLIackEligibility {
  if (inputs.iackEligibility && inputs.iackEligibility !== "none") {
    return inputs.iackEligibility;
  }

  return inputs.hasYoungChildren ? "noFiscalPartner" : "none";
}

function clampAmount(value: number, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), Math.max(0, max));
}

function calculateAnnuityAnnualMargin({
  grossSalary,
  pensionAccrualFactorA,
}: {
  grossSalary: number;
  pensionAccrualFactorA: number;
}) {
  const premiumBase = Math.min(
    NL_LIJFRENTE_2026.maxPremiumBase,
    Math.max(
      0,
      Math.min(grossSalary, NL_LIJFRENTE_2026.incomeCap) -
        NL_LIJFRENTE_2026.aowFranchise,
    ),
  );

  return clampAmount(
    premiumBase * NL_LIJFRENTE_2026.annualMarginRate -
      pensionAccrualFactorA * NL_LIJFRENTE_2026.factorAMultiplier,
    NL_LIJFRENTE_2026.maxAnnualMargin,
  );
}

function getAnnuityInputs(inputs: Partial<NLCalculatorInputs>) {
  const grossSalary = Math.max(0, inputs.grossSalary ?? NL_DEFAULT_SALARY);
  const pensionAccrualFactorA = clampAmount(
    inputs.pensionAccrualFactorA ?? 0,
  );
  const annuityAnnualMargin = calculateAnnuityAnnualMargin({
    grossSalary,
    pensionAccrualFactorA,
  });
  const unusedAnnuityReserveMargin = clampAmount(
    inputs.unusedAnnuityReserveMargin ?? 0,
    NL_LIJFRENTE_2026.maxReserveMargin,
  );

  return {
    grossSalary,
    pensionAccrualFactorA,
    annuityAnnualMargin,
    unusedAnnuityReserveMargin,
  };
}

function calculateAnnuityContributionLimit(
  inputs: Partial<NLCalculatorInputs>,
  taxableIncomeBeforeAnnuityDeduction = Infinity,
) {
  const { annuityAnnualMargin, unusedAnnuityReserveMargin } =
    getAnnuityInputs(inputs);

  return Math.min(
    annuityAnnualMargin + unusedAnnuityReserveMargin,
    taxableIncomeBeforeAnnuityDeduction,
  );
}

// ============================================================================
// NETHERLANDS CALCULATOR
// ============================================================================
export function calculateNL(inputs: NLCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
  } = inputs;
  const {
    pensionAccrualFactorA,
    annuityAnnualMargin,
    unusedAnnuityReserveMargin,
  } = getAnnuityInputs(inputs);
  const employeePensionPremiumAnnual = Math.min(
    Math.max(0, inputs.employeePensionPremiumAnnual ?? 0),
    Math.max(0, grossSalary),
  );
  const payrollTaxBaseBeforeRuling = Math.max(
    0,
    grossSalary - employeePensionPremiumAnnual,
  );
  const thirtyPercentRulingType = normalizeRulingType(inputs);
  const iackEligibility = normalizeIackEligibility(inputs);

  const {
    taxExemptAllowance,
    salaryNorm: thirtyPercentSalaryNorm,
    maxAllowance: thirtyPercentMaxAllowance,
  } = calculateThirtyPercentAllowance(
    payrollTaxBaseBeforeRuling,
    thirtyPercentRulingType,
  );
  const taxableIncomeBeforeAnnuityDeduction =
    payrollTaxBaseBeforeRuling - taxExemptAllowance;
  const personalAnnuityContributionLimit = calculateAnnuityContributionLimit(
    inputs,
    taxableIncomeBeforeAnnuityDeduction,
  );
  const personalAnnuityContribution = clampAmount(
    inputs.contributions?.lijfrenteContribution ?? 0,
    personalAnnuityContributionLimit,
  );
  const taxableIncome =
    taxableIncomeBeforeAnnuityDeduction - personalAnnuityContribution;

  // Calculate combined progressive tax (for backwards compat / bracket display)
  const { totalTax: combinedTaxBeforeCredits, bracketTaxes } =
    calculateProgressiveTax(taxableIncome);

  // Calculate SEPARATE income tax and social security
  const socialSecurity = calculateSocialSecurity(taxableIncome);
  const incomeTaxBreakdown = calculateIncomeTax(taxableIncome);

  // Tax before credits = income tax + social security
  const taxBeforeCredits = incomeTaxBreakdown.total + socialSecurity.total;

  // Calculate tax credits (based on taxable income)
  // Credits apply to the combined tax, proportionally split between income tax and social security
  const generalTaxCredit = calculateGeneralTaxCredit(taxableIncome);
  const laborTaxCredit = calculateLaborTaxCredit(taxableIncome);
  const iackCredit = calculateIACK(taxableIncome, iackEligibility !== "none");
  const totalCredits = generalTaxCredit + laborTaxCredit + iackCredit;

  // Final combined tax cannot be negative
  const totalTax = Math.max(0, taxBeforeCredits - totalCredits);

  // Credits reduce tax proportionally - calculate final income tax and social security
  // The Dutch system applies credits to combined tax, so we prorate the reduction
  const creditRatio =
    taxBeforeCredits > 0 ? Math.min(1, totalCredits / taxBeforeCredits) : 0;
  const finalIncomeTax = Math.max(
    0,
    incomeTaxBreakdown.total * (1 - creditRatio),
  );
  const finalSocialSecurityTax = Math.max(
    0,
    socialSecurity.total * (1 - creditRatio),
  );

  const taxes: NLTaxBreakdown = {
    totalIncomeTax: totalTax,
    incomeTax: finalIncomeTax,
    socialSecurityTax: finalSocialSecurityTax,
  };

  const totalDeductions =
    totalTax + employeePensionPremiumAnnual + personalAnnuityContribution;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: NLBreakdown = {
    type: "NL",
    bracketTaxes,
    socialSecurity,
    incomeTaxBreakdown,
    taxCredits: {
      generalTaxCredit,
      laborTaxCredit,
      iackCredit,
      totalCredits,
    },
    taxBeforeCredits: combinedTaxBeforeCredits, // Use combined for UI display
    taxableIncome,
    employeePensionPremiumAnnual,
    payrollTaxBaseBeforeRuling,
    taxableIncomeBeforeAnnuityDeduction,
    pensionAccrualFactorA,
    annuityAnnualMargin,
    unusedAnnuityReserveMargin,
    personalAnnuityContribution,
    personalAnnuityContributionLimit,
    thirtyPercentRulingApplied: thirtyPercentRulingType !== "none",
    taxExemptAllowance,
    thirtyPercentRulingType,
    thirtyPercentSalaryNorm,
    thirtyPercentMaxAllowance,
    iackEligibility,
  };

  return {
    country: "NL",
    currency: "EUR",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
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
export const NLCalculator: CountryCalculator = {
  countryCode: "NL",
  config: NL_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NL") {
      throw new Error("NLCalculator can only calculate NL inputs");
    }
    return calculateNL(inputs as NLCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const nlInputs = {
      ...this.getDefaultInputs(),
      ...inputs,
    } as Partial<NLCalculatorInputs>;
    const payrollTaxBaseBeforeRuling = Math.max(
      0,
      (nlInputs.grossSalary ?? NL_DEFAULT_SALARY) -
        clampAmount(nlInputs.employeePensionPremiumAnnual ?? 0),
    );
    const thirtyPercentRulingType = normalizeRulingType(
      nlInputs as NLCalculatorInputs,
    );
    const { taxExemptAllowance } = calculateThirtyPercentAllowance(
      payrollTaxBaseBeforeRuling,
      thirtyPercentRulingType,
    );
    const taxableIncomeBeforeAnnuityDeduction = Math.max(
      0,
      payrollTaxBaseBeforeRuling - taxExemptAllowance,
    );

    return {
      lijfrenteContribution: {
        limit: calculateAnnuityContributionLimit(
          nlInputs,
          taxableIncomeBeforeAnnuityDeduction,
        ),
        name: "Lijfrente pension-account deposit",
        description:
          "Self-paid annuity or pension-account deposits are deductible only within your calculated jaarruimte and reserveringsruimte; this uses 2026 Belastingdienst limits and the salary/factor-A inputs shown above.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): NLCalculatorInputs {
    return {
      country: "NL",
      grossSalary: NL_DEFAULT_SALARY,
      payFrequency: "monthly",
      hasThirtyPercentRuling: false,
      hasYoungChildren: false,
      thirtyPercentRulingType: "none",
      iackEligibility: "none",
      employeePensionPremiumAnnual: 0,
      pensionAccrualFactorA: 0,
      unusedAnnuityReserveMargin: 0,
      contributions: {
        lijfrenteContribution: 0,
      },
    };
  },
};
