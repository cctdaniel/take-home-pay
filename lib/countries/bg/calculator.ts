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
} from "./constants/tax-year-2026";
import type { BGBreakdown, BGCalculatorInputs, BGTaxBreakdown } from "./types";

export function calculateBG(inputs: BGCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, BG_SOCIAL_ANNUAL_CAP);
  const socialSecurity = roundCurrency(socialBase * BG_SOCIAL_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - socialSecurity));
  const incomeTax = roundCurrency(taxableIncome * BG_PIT_RATE);

  const taxes: BGTaxBreakdown = {
    type: "BG",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const totalDeductions = totalTax;
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
    voluntaryContributions: { total: 0 },
    assumptions: [
      "Employee social security 13.78% on gross capped at EUR 2,111.64/month.",
      "Flat 10% personal income tax on gross minus employee social security.",
      "No voluntary pension or tax-reducing payroll contributions modeled.",
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

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): BGCalculatorInputs {
    return {
      country: "BG",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
