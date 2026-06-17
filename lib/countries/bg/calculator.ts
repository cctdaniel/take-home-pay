import { clampAmount } from "@/lib/utils";
import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { BG_CONFIG } from "./config";
import {
  BG_PIT_RATE,
  BG_SOCIAL_ANNUAL_CAP,
  BG_SOCIAL_EMPLOYEE_RATE,
  BG_SOURCE_URLS,
  BG_VOLUNTARY_PENSION_MAX_TAX_BASE_RATE,
} from "./constants/tax-year-2026";
import type { BGBreakdown, BGCalculatorInputs, BGTaxBreakdown } from "./types";

function getVoluntaryPensionLimit(grossIncome: number, socialSecurity: number): number {
  const taxBase = Math.max(0, grossIncome - socialSecurity);
  return roundCurrency(taxBase * BG_VOLUNTARY_PENSION_MAX_TAX_BASE_RATE);
}

export function calculateBG(inputs: BGCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, BG_SOCIAL_ANNUAL_CAP);
  const socialSecurity = roundCurrency(socialBase * BG_SOCIAL_EMPLOYEE_RATE);
  const voluntaryPensionLimit = getVoluntaryPensionLimit(grossIncome, socialSecurity);
  const voluntaryPension = clampAmount(
    inputs.contributions?.voluntaryPension,
    voluntaryPensionLimit,
  );
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - socialSecurity - voluntaryPension),
  );
  const incomeTax = roundCurrency(taxableIncome * BG_PIT_RATE);

  const taxes: BGTaxBreakdown = {
    type: "BG",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const totalDeductions = totalTax + voluntaryPension;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: BGBreakdown = {
    type: "BG",
    grossIncome,
    socialSecurity: {
      rate: BG_SOCIAL_EMPLOYEE_RATE,
      base: socialBase,
      employee: socialSecurity,
      annualCap: BG_SOCIAL_ANNUAL_CAP,
    },
    taxableIncome,
    incomeTax: { rate: BG_PIT_RATE, total: incomeTax },
    voluntaryContributions: {
      voluntaryPension,
      voluntaryPensionLimit,
      total: voluntaryPension,
    },
    assumptions: [
      "Employee social security 13.78% on gross capped at EUR 2,111.64/month.",
      "Flat 10% personal income tax on gross minus employee social security and voluntary pension.",
      "Voluntary supplementary pension deductible up to 10% of the annual tax base.",
      "Excludes health insurance top-ups, meal vouchers, and employer-only costs.",
    ],
    sourceUrls: Object.values(BG_SOURCE_URLS),
  };

  return {
    country: "BG",
    currency: "EUR",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const BGCalculator: CountryCalculator = {
  countryCode: "BG",
  config: BG_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BG") {
      throw new Error("BGCalculator can only calculate BG inputs");
    }
    return calculateBG(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: BGCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 36_000;
    const socialBase = Math.min(Math.max(0, gross), BG_SOCIAL_ANNUAL_CAP);
    const socialSecurity = roundCurrency(socialBase * BG_SOCIAL_EMPLOYEE_RATE);
    const limit = getVoluntaryPensionLimit(gross, socialSecurity);
    return {
      voluntaryPension: {
        limit,
        name: "Voluntary supplementary pension",
        description:
          "Third-pillar pension contributions deductible up to 10% of the annual tax base.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): BGCalculatorInputs {
    return {
      country: "BG",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: { voluntaryPension: 0 },
    };
  },
};
