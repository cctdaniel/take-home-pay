// ============================================================================
// AUSTRALIA CALCULATOR IMPLEMENTATION
// Source: Australian Taxation Office (ATO)
// https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
// ============================================================================

import type {
  AUBreakdown,
  AUCalculatorInputs,
  AUTaxBreakdown,
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { AU_CONFIG } from "./config";
import {
  AU_CONCESSIONAL_SUPER_CAP_2026,
  AU_NON_RESIDENT_TAX_BRACKETS_2026,
  AU_RESIDENT_TAX_BRACKETS_2026,
  calculateDivision293Tax,
  calculateLITO,
  calculateMedicareLevy,
  calculateMedicareLevySurcharge,
  calculateSuperannuation,
  getMedicareLevySurchargeThresholds,
  getMedicareLevyThresholds,
} from "./constants/tax-brackets-2026";

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

/**
 * Calculate progressive tax using tax brackets
 */
function calculateProgressiveTax(income: number, brackets: TaxBracket[]) {
  const bracketTaxes = brackets.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(income, bracket.max) - bracket.min,
    );
    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  const totalTax = bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0);

  return { totalTax, bracketTaxes };
}

function clampAmount(value: number, max: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value), Math.max(0, max));
}

function calculateRemainingConcessionalCap(grossSalary: number): number {
  const employerSuperannuation = calculateSuperannuation(grossSalary);

  return Math.max(0, AU_CONCESSIONAL_SUPER_CAP_2026 - employerSuperannuation);
}

// ============================================================================
// AUSTRALIA CALCULATOR
// ============================================================================
export function calculateAU(inputs: AUCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    medicareFamilyStatus = "single",
    medicareSpouseIncome = 0,
    numberOfDependentChildren = 0,
    hasPrivateHealthInsurance,
    contributions,
  } = inputs;

  const isResident = residencyType === "resident";
  const normalizedDependentChildren = Math.max(
    0,
    Math.floor(numberOfDependentChildren),
  );
  const normalizedSpouseIncome = Math.max(0, medicareSpouseIncome);
  const normalizedMedicareFamilyStatus =
    medicareFamilyStatus === "family" ? "family" : "single";
  const employerSuperannuation = calculateSuperannuation(grossSalary);
  const remainingConcessionalCap =
    calculateRemainingConcessionalCap(grossSalary);
  const salarySacrificeSuper = clampAmount(
    contributions?.salarySacrificeSuper ?? 0,
    remainingConcessionalCap,
  );

  // Step 1: Salary-sacrifice / deductible concessional super lowers taxable salary.
  const taxBaseBeforeAnnualDeductions = Math.max(
    0,
    grossSalary - salarySacrificeSuper,
  );
  const workRelatedExpenses = clampAmount(
    contributions?.workRelatedExpenses ?? 0,
    taxBaseBeforeAnnualDeductions,
  );
  const charitableDonations = clampAmount(
    contributions?.charitableDonations ?? 0,
    taxBaseBeforeAnnualDeductions - workRelatedExpenses,
  );
  const taxableIncome = Math.max(
    0,
    taxBaseBeforeAnnualDeductions - workRelatedExpenses - charitableDonations,
  );

  // Step 2: Calculate income tax based on residency
  const taxBrackets = isResident
    ? AU_RESIDENT_TAX_BRACKETS_2026
    : AU_NON_RESIDENT_TAX_BRACKETS_2026;

  const { totalTax: grossIncomeTax, bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    taxBrackets,
  );

  // Step 3: Calculate LITO (residents only)
  const lito = isResident ? calculateLITO(taxableIncome) : 0;

  // Step 4: Final income tax after offsets
  const incomeTax = Math.max(0, grossIncomeTax - lito);

  // Step 5: Calculate Medicare levy (residents only)
  const medicareFamilyIncome =
    normalizedMedicareFamilyStatus === "family"
      ? taxableIncome + normalizedSpouseIncome
      : taxableIncome;
  const medicareLevyThresholds = getMedicareLevyThresholds({
    familyStatus: normalizedMedicareFamilyStatus,
    numberOfDependentChildren: normalizedDependentChildren,
  });
  const medicareLevy = isResident
    ? calculateMedicareLevy(taxableIncome, {
        familyStatus: normalizedMedicareFamilyStatus,
        spouseTaxableIncome: normalizedSpouseIncome,
        numberOfDependentChildren: normalizedDependentChildren,
      })
    : 0;

  // Step 6: Calculate Medicare levy surcharge (if no private health insurance)
  // MLS income adds reportable super back, so salary sacrifice should not lower
  // the surcharge threshold; ordinary deductions still reduce taxable income.
  const medicareSurchargeIncome =
    normalizedMedicareFamilyStatus === "family"
      ? taxableIncome + salarySacrificeSuper + normalizedSpouseIncome
      : taxableIncome + salarySacrificeSuper;
  const medicareSurchargeThresholds = getMedicareLevySurchargeThresholds({
    familyStatus: normalizedMedicareFamilyStatus,
    numberOfDependentChildren: normalizedDependentChildren,
  });
  const familyAwareMedicareLevySurcharge = isResident
    ? calculateMedicareLevySurcharge(
        taxableIncome + salarySacrificeSuper,
        hasPrivateHealthInsurance,
        {
          familyStatus: normalizedMedicareFamilyStatus,
          spouseIncomeForSurcharge: normalizedSpouseIncome,
          numberOfDependentChildren: normalizedDependentChildren,
        },
      )
    : 0;

  // Step 8: Calculate Division 293 tax (for high income earners)
  // Concessional contributions = employer super plus selected salary sacrifice.
  const concessionalContributions = employerSuperannuation + salarySacrificeSuper;
  const {
    division293Tax,
    division293Income,
    taxableContributions,
  } = calculateDivision293Tax(taxableIncome, concessionalContributions);

  // Step 9: Build tax breakdown
  const taxes: AUTaxBreakdown = {
    totalIncomeTax: incomeTax + medicareLevy + familyAwareMedicareLevySurcharge + division293Tax,
    incomeTax,
    medicareLevy,
    medicareLevySurcharge: familyAwareMedicareLevySurcharge,
    division293Tax,
  };

  // Step 10: Calculate totals
  const totalTax = incomeTax + medicareLevy + familyAwareMedicareLevySurcharge + division293Tax;
  const totalDeductions = totalTax + salarySacrificeSuper;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Step 11: Build detailed breakdown
  const breakdown: AUBreakdown = {
    type: "AU",
    taxableIncome,
    bracketTaxes,
    grossIncomeTax,
    lito,
    incomeTax,
    taxBaseBeforeAnnualDeductions,
    workRelatedExpenses,
    charitableDonations,
    medicareLevy,
    medicareLevySurcharge: familyAwareMedicareLevySurcharge,
    hasPrivateHealthInsurance,
    medicareFamilyStatus: normalizedMedicareFamilyStatus,
    medicareSpouseIncome: normalizedSpouseIncome,
    numberOfDependentChildren: normalizedDependentChildren,
    medicareFamilyIncome,
    medicareLevyReductionApplied:
      isResident &&
      medicareFamilyIncome > medicareLevyThresholds.lowerThreshold &&
      medicareFamilyIncome <= medicareLevyThresholds.upperThreshold,
    medicareLevyThresholds,
    medicareSurchargeIncome,
    medicareSurchargeThresholds,
    division293Tax,
    division293Income,
    division293Threshold: 250000,
    superannuation: {
      employerContribution: employerSuperannuation,
      salarySacrificeContribution: salarySacrificeSuper,
      rate: 0.12,
      concessionalContributions,
      division293TaxableContributions: taxableContributions,
      concessionalCap: AU_CONCESSIONAL_SUPER_CAP_2026,
      remainingConcessionalCap,
    },
    isResident,
  };

  return {
    country: "AU",
    currency: "AUD",
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
export const AUCalculator: CountryCalculator = {
  countryCode: "AU",
  config: AU_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "AU") {
      throw new Error("AUCalculator can only calculate AU inputs");
    }
    return calculateAU(inputs as AUCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return []; // Australia has no state income tax
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const grossSalary = inputs?.grossSalary ?? 100000;
    const remainingConcessionalCap =
      calculateRemainingConcessionalCap(grossSalary);
    const auInputs = inputs as Partial<AUCalculatorInputs> | undefined;
    const salarySacrificeSuper = clampAmount(
      auInputs?.contributions?.salarySacrificeSuper ?? 0,
      remainingConcessionalCap,
    );
    const taxBaseBeforeAnnualDeductions = Math.max(
      0,
      grossSalary - salarySacrificeSuper,
    );
    const workRelatedExpenses = clampAmount(
      auInputs?.contributions?.workRelatedExpenses ?? 0,
      taxBaseBeforeAnnualDeductions,
    );

    return {
      salarySacrificeSuper: {
        limit: remainingConcessionalCap,
        name: "Salary-sacrifice / deductible concessional super",
        description:
          "Employee-controlled concessional super contribution up to the remaining ATO concessional cap after modeled employer Super Guarantee.",
        preTax: true,
      },
      workRelatedExpenses: {
        limit: taxBaseBeforeAnnualDeductions,
        name: "Work-related deductions",
        description:
          "Unreimbursed employment expenses that directly relate to earning salary income, capped here to the modeled post-super salary base.",
        preTax: true,
      },
      charitableDonations: {
        limit: Math.max(0, taxBaseBeforeAnnualDeductions - workRelatedExpenses),
        name: "DGR gifts / donations",
        description:
          "Deductible gifts of A$2 or more to deductible gift recipients, capped here to the remaining modeled taxable salary base after work deductions.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): AUCalculatorInputs {
    return {
      country: "AU",
      grossSalary: 100000,
      payFrequency: "monthly",
      residencyType: "resident",
      medicareFamilyStatus: "single",
      medicareSpouseIncome: 0,
      numberOfDependentChildren: 0,
      hasPrivateHealthInsurance: true, // Assume most have PHI
      contributions: {
        salarySacrificeSuper: 0,
        workRelatedExpenses: 0,
        charitableDonations: 0,
      },
    };
  },
};
