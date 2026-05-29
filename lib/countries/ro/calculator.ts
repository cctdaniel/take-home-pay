import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount, clampCount } from "@/lib/utils";
import { RO_CONFIG } from "./config";
import {
  RO_CAS_RATE,
  RO_CASS_RATE,
  RO_DEPENDENT_DEDUCTION_MONTHLY,
  RO_PERSONAL_DEDUCTION_INTERCEPT_MONTHLY,
  RO_PERSONAL_DEDUCTION_SLOPE,
  RO_PIT_RATE,
  RO_PRIVATE_PENSION_CAP_RON_2026,
  RO_SOCIAL_CAP_ANNUAL_2026,
  RO_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { ROBreakdown, ROCalculatorInputs, ROTaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

export function calculateRomanianPersonalDeduction(
  grossAnnual: number,
  numberOfChildren: number,
): number {
  const grossMonthly = grossAnnual / 12;
  const monthlyDeduction = Math.max(
    0,
    RO_PERSONAL_DEDUCTION_INTERCEPT_MONTHLY -
      RO_PERSONAL_DEDUCTION_SLOPE * grossMonthly +
      numberOfChildren * RO_DEPENDENT_DEDUCTION_MONTHLY,
  );
  return roundCurrency(monthlyDeduction * 12);
}

export function calculateRO(inputs: ROCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const children = clampCount(inputs.numberOfChildren, 10);
  const privatePension = clampAmount(
    inputs.contributions?.privatePension,
    RO_PRIVATE_PENSION_CAP_RON_2026,
  );
  const socialBase = Math.min(grossIncome, RO_SOCIAL_CAP_ANNUAL_2026);
  const cas = roundCurrency(socialBase * RO_CAS_RATE);
  const cass = roundCurrency(socialBase * RO_CASS_RATE);
  const personalDeduction = calculateRomanianPersonalDeduction(
    grossIncome,
    children,
  );
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - cas - cass - personalDeduction - privatePension),
  );
  const incomeTax = roundCurrency(taxableIncome * RO_PIT_RATE);

  const taxes: ROTaxBreakdown = {
    type: "RO",
    totalIncomeTax: incomeTax,
    incomeTax,
    cas,
    cass,
  };
  const totalTax = incomeTax + cas + cass;
  const totalDeductions = totalTax + privatePension;
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: ROBreakdown = {
    type: "RO",
    grossIncome,
    numberOfChildren: children,
    cas: { rate: RO_CAS_RATE, base: socialBase, total: cas },
    cass: { rate: RO_CASS_RATE, base: socialBase, total: cass },
    personalDeduction,
    taxableIncome,
    incomeTax: { rate: RO_PIT_RATE, total: incomeTax },
    voluntaryContributions: {
      privatePension,
      privatePensionLimit: RO_PRIVATE_PENSION_CAP_RON_2026,
      total: privatePension,
    },
    assumptions: [
      "Employee CAS 25% and CASS 10% on gross (capped annual base), then 10% income tax on remaining base after personal deduction.",
      "Personal deduction simplified from 2026 payroll tables; dependent allowance per child.",
      "Pillar III voluntary pension up to EUR 400/year reduces the income tax base. Excludes minimum-wage fiscal facility and special sector exemptions.",
    ],
    sourceUrls: Object.values(RO_SOURCE_URLS),
  };

  return {
    country: "RO",
    currency: "RON",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: grossIncome > 0 ? totalTax / grossIncome : 0,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const ROCalculator: CountryCalculator = {
  countryCode: "RO",
  config: RO_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "RO") {
      throw new Error("ROCalculator can only calculate RO inputs");
    }
    return calculateRO(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      privatePension: {
        limit: RO_PRIVATE_PENSION_CAP_RON_2026,
        name: "Voluntary private pension (Pillar III)",
        description:
          "Employee contributions via payroll reduce the income tax base up to EUR 400 per year.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ROCalculatorInputs {
    return {
      country: "RO",
      grossSalary: 120_000,
      payFrequency: "monthly",
      numberOfChildren: 0,
      contributions: { privatePension: 0 },
    };
  },
};
