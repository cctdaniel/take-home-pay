import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { ZA_CONFIG } from "./config";
import {
  calculateZaGrossPaye,
  calculateZaMedicalTaxCredit,
  calculateZaPaye,
  ZA_REBATES_2026,
  ZA_RETIREMENT_ANNUITY_2026,
  ZA_SOURCE_URLS,
  ZA_UIF_2026,
} from "./constants/tax-year-2026";
import type { ZABreakdown, ZACalculatorInputs, ZATaxBreakdown } from "./types";

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

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getRetirementAnnuityLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * ZA_RETIREMENT_ANNUITY_2026.contributionRateLimit,
    ZA_RETIREMENT_ANNUITY_2026.annualDollarLimit,
  );
}

export function calculateZA(inputs: ZACalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const retirementAnnuityLimit = getRetirementAnnuityLimit(grossSalary);
  const retirementAnnuity = clampAmount(
    inputs.contributions?.retirementAnnuity,
    retirementAnnuityLimit,
  );
  const taxableIncome = Math.max(0, grossSalary - retirementAnnuity);
  const payeBeforeCredits = calculateZaGrossPaye(taxableIncome);
  const payeAfterRebate = calculateZaPaye(taxableIncome);
  const medicalTaxCredit = calculateZaMedicalTaxCredit({
    mainMember: true,
    additionalDependents: inputs.medicalDependents,
  });
  const incomeTax = roundCurrency(
    Math.max(0, payeAfterRebate - medicalTaxCredit),
  );
  const uif = roundCurrency(
    Math.min(
      grossSalary * ZA_UIF_2026.employeeRate,
      ZA_UIF_2026.maximumAnnualContribution,
    ),
  );

  const taxes: ZATaxBreakdown = {
    type: "ZA",
    totalIncomeTax: incomeTax,
    incomeTax,
    uif,
  };

  const totalTax = incomeTax + uif;
  const totalDeductions = totalTax + retirementAnnuity;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: ZABreakdown = {
    type: "ZA",
    grossIncome: grossSalary,
    taxableIncome,
    payeBeforeCredits,
    primaryRebate: ZA_REBATES_2026.primary,
    medicalTaxCredit,
    medicalDependents: inputs.medicalDependents,
    retirementAnnuity,
    retirementAnnuityLimit,
    uif: {
      contribution: uif,
      rate: ZA_UIF_2026.employeeRate,
      maximumAnnual: ZA_UIF_2026.maximumAnnualContribution,
    },
    assumptions: [
      "PAYE 2025/26 slices with primary rebate ZAR 17,235.",
      "UIF 1% employee capped at ZAR 17,712/year.",
      "Retirement annuity deduction up to 27.5% of income, max ZAR 350,000.",
      "Medical credits R364 main + R246 per dependent per month.",
      "Excludes SDL, travel allowances, and age/secondary/tertiary rebates.",
    ],
    sourceUrls: ZA_SOURCE_URLS,
  };

  return {
    country: "ZA",
    currency: "ZAR",
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
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const ZACalculator: CountryCalculator = {
  countryCode: "ZA",
  config: ZA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "ZA") {
      throw new Error("ZACalculator can only calculate ZA inputs");
    }
    return calculateZA(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: ZACalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 600_000;
    return {
      retirementAnnuity: {
        limit: getRetirementAnnuityLimit(gross),
        name: "Retirement annuity",
        description: "Pre-tax RA contribution (27.5% of income, max R350k)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ZACalculatorInputs {
    return {
      country: "ZA",
      grossSalary: 600_000,
      payFrequency: "monthly",
      medicalDependents: 0,
      contributions: {
        retirementAnnuity: 0,
      },
    };
  },
};
