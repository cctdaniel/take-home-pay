// ============================================================================
// GREECE CALCULATOR IMPLEMENTATION
// Tax Year: 2026
// ============================================================================

import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { GR_CONFIG } from "./config";
import {
  calculateGreekEmploymentTaxReduction,
  calculateGreekProgressiveIncomeTax,
  calculateGreekSocialInsurance,
  getGreekEmploymentTaxBrackets2026,
  GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE,
  GREECE_SOCIAL_INSURANCE_2026,
} from "./constants/tax-brackets-2026";
import type { GRBreakdown, GRCalculatorInputs, GRTaxBreakdown } from "./types";

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

export function calculateGR(inputs: GRCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    age,
    numberOfDependents,
    contributions,
  } = inputs;

  const isResident = residencyType === "resident";
  const normalizedAge = Math.max(16, Math.floor(age));
  const normalizedDependents = Math.max(0, Math.floor(numberOfDependents));

  // e-EFKA employee contributions are deductible for income tax purposes.
  const socialInsurance = calculateGreekSocialInsurance(grossSalary);
  const pensionContributionLimit =
    grossSalary * GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE;
  const occupationalPensionContribution = isResident
    ? Math.min(
        Math.max(0, contributions.occupationalPensionContribution || 0),
        pensionContributionLimit,
      )
    : 0;
  const taxableIncome = Math.max(
    0,
    grossSalary -
      socialInsurance.employeeTotal -
      occupationalPensionContribution,
  );

  // Conservative non-resident treatment: use the standard no-child adult scale
  // and do not apply resident employment tax reductions.
  const effectiveDependentsForScale = isResident ? normalizedDependents : 0;
  const effectiveAgeForScale = isResident ? normalizedAge : 31;
  const taxBrackets = getGreekEmploymentTaxBrackets2026(
    effectiveDependentsForScale,
    effectiveAgeForScale,
  );
  const { totalTax: grossIncomeTax, bracketTaxes } =
    calculateGreekProgressiveIncomeTax(taxableIncome, taxBrackets);

  const taxReduction = isResident
    ? calculateGreekEmploymentTaxReduction(
        taxableIncome,
        normalizedDependents,
        grossIncomeTax,
      )
    : {
        baseReduction: 0,
        taper: 0,
        availableReduction: 0,
        appliedReduction: 0,
      };
  const incomeTax = Math.max(
    0,
    grossIncomeTax - taxReduction.appliedReduction,
  );

  const taxes: GRTaxBreakdown = {
    type: "GR",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance: socialInsurance.employeeTotal,
  };

  const totalTax = incomeTax + socialInsurance.employeeTotal;
  const totalDeductions = totalTax + occupationalPensionContribution;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: GRBreakdown = {
    type: "GR",
    grossIncome: grossSalary,
    taxableIncome,
    isResident,
    age: normalizedAge,
    numberOfDependents: normalizedDependents,
    effectiveDependentsForScale,
    effectiveAgeForScale,
    bracketTaxes,
    incomeTax: {
      grossIncomeTax,
      baseTaxReduction: taxReduction.baseReduction,
      taxReductionTaper: taxReduction.taper,
      availableTaxReduction: taxReduction.availableReduction,
      appliedTaxReduction: taxReduction.appliedReduction,
      finalIncomeTax: incomeTax,
    },
    socialInsurance: {
      employee: socialInsurance.employeeTotal,
      employer: socialInsurance.employerTotal,
      employeeRate: GREECE_SOCIAL_INSURANCE_2026.employeeRate,
      employerRate: GREECE_SOCIAL_INSURANCE_2026.employerRate,
      insurableIncome: socialInsurance.insurableIncome,
      monthlyCeiling: GREECE_SOCIAL_INSURANCE_2026.monthlyCeiling,
      annualCeiling: GREECE_SOCIAL_INSURANCE_2026.annualCeiling,
      salaryInstallments: socialInsurance.salaryInstallments,
      mainPensionEmployee: socialInsurance.mainPensionEmployee,
      supplementaryPensionEmployee:
        socialInsurance.supplementaryPensionEmployee,
      healthcareEmployee: socialInsurance.healthcareEmployee,
      otherFundsEmployee: socialInsurance.otherFundsEmployee,
    },
    voluntaryContributions: {
      occupationalPension: occupationalPensionContribution,
      pensionContributionLimit,
      total: occupationalPensionContribution,
    },
  };

  return {
    country: "GR",
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

export const GRCalculator: CountryCalculator = {
  countryCode: "GR",
  config: GR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "GR") {
      throw new Error("GRCalculator can only calculate GR inputs");
    }
    return calculateGR(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const grInputs = inputs as Partial<GRCalculatorInputs> | undefined;
    const salary = Math.max(0, grInputs?.grossSalary ?? 24_000);
    const isResident = (grInputs?.residencyType ?? "resident") === "resident";

    return {
      occupationalPensionContribution: {
        limit: isResident
          ? salary * GREECE_OCCUPATIONAL_PENSION_CONTRIBUTION_LIMIT_RATE
          : 0,
        name: "Occupational Pension",
        description:
          "Voluntary occupational pension or group pension insurance contribution, capped at 20% of gross employment income.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): GRCalculatorInputs {
    return {
      country: "GR",
      grossSalary: 24_000,
      payFrequency: "monthly",
      residencyType: "resident",
      age: 31,
      numberOfDependents: 0,
      contributions: {
        occupationalPensionContribution: 0,
      },
    };
  },
};
