import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { RS_CONFIG } from "./config";
import {
  RS_NON_TAXABLE_ANNUAL,
  RS_PIT_RATE,
  RS_SOCIAL_ANNUAL_CAP,
  RS_SOCIAL_EMPLOYEE_RATE,
  RS_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { RSBreakdown, RSCalculatorInputs, RSTaxBreakdown } from "./types";

export function calculateRS(inputs: RSCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, RS_SOCIAL_ANNUAL_CAP);
  const socialSecurity = roundCurrency(socialBase * RS_SOCIAL_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - socialSecurity - RS_NON_TAXABLE_ANNUAL),
  );
  const incomeTax = roundCurrency(taxableIncome * RS_PIT_RATE);

  const taxes: RSTaxBreakdown = {
    type: "RS",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const totalDeductions = totalTax;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: RSBreakdown = {
    type: "RS",
    grossIncome,
    socialSecurity: {
      rate: RS_SOCIAL_EMPLOYEE_RATE,
      base: socialBase,
      employee: socialSecurity,
      annualCap: RS_SOCIAL_ANNUAL_CAP,
    },
    nonTaxableAmount: RS_NON_TAXABLE_ANNUAL,
    taxableIncome,
    incomeTax: { rate: RS_PIT_RATE, total: incomeTax },
    voluntaryContributions: { total: 0 },
    assumptions: [
      "Employee social 19.9% on gross capped at RSD 732,820/month.",
      "Flat 10% personal income tax after employee social and RSD 410,652 annual non-taxable amount.",
      "No voluntary pension or private insurance deductions modeled.",
      "Excludes local surtaxes, meal allowances, and employer-only payroll costs.",
    ],
    sourceUrls: Object.values(RS_SOURCE_URLS),
  };

  return {
    country: "RS",
    currency: "RSD",
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

export const RSCalculator: CountryCalculator = {
  countryCode: "RS",
  config: RS_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "RS") {
      throw new Error("RSCalculator can only calculate RS inputs");
    }
    return calculateRS(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): RSCalculatorInputs {
    return {
      country: "RS",
      grossSalary: 2_160_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
