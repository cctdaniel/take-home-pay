import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { LU_CONFIG } from "./config";
import {
  LU_EMPLOYEE_SOCIAL_CAP_ANNUAL_2026,
  LU_EMPLOYEE_SOCIAL_RATE,
  LU_PIT_BRACKETS_2026,
  LU_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { LUBreakdown, LUCalculatorInputs, LUTaxBreakdown } from "./types";

export function calculateLU(inputs: LUCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, LU_EMPLOYEE_SOCIAL_CAP_ANNUAL_2026);
  const employeeSocial = roundCurrency(socialBase * LU_EMPLOYEE_SOCIAL_RATE);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - employeeSocial));
  const progressive = calculateProgressiveTax(taxableIncome, LU_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: LUTaxBreakdown = {
    type: "LU",
    totalIncomeTax: incomeTax,
    incomeTax,
    employeeSocial,
  };
  const totalTax = incomeTax + employeeSocial;
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: LUBreakdown = {
    type: "LU",
    grossIncome,
    employeeSocial: {
      rate: LU_EMPLOYEE_SOCIAL_RATE,
      base: socialBase,
      cap: LU_EMPLOYEE_SOCIAL_CAP_ANNUAL_2026,
      total: employeeSocial,
    },
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "Employee social security modeled at 12.45% on gross up to EUR 140,364 annual insurable base.",
      "Progressive income tax on taxable salary after employee social contributions.",
      "Excludes tax class credits, dependency increases, and special expatriate regimes.",
    ],
    sourceUrls: Object.values(LU_SOURCE_URLS),
  };

  return {
    country: "LU",
    currency: "EUR",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
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

export const LUCalculator: CountryCalculator = {
  countryCode: "LU",
  config: LU_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "LU") {
      throw new Error("LUCalculator can only calculate LU inputs");
    }
    return calculateLU(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): LUCalculatorInputs {
    return {
      country: "LU",
      grossSalary: 72_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
