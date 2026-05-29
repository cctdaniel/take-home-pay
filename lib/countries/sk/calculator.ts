import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { SK_CONFIG } from "./config";
import {
  calculateSlovakAllowance,
  SK_HEALTH_EMPLOYEE_RATE,
  SK_PIT_BRACKETS_2026,
  SK_SOCIAL_ANNUAL_CAP,
  SK_SOCIAL_EMPLOYEE_RATE,
  SK_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { SKBreakdown, SKCalculatorInputs, SKTaxBreakdown } from "./types";

export function calculateSK(inputs: SKCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, SK_SOCIAL_ANNUAL_CAP);
  const socialInsurance = roundCurrency(socialBase * SK_SOCIAL_EMPLOYEE_RATE);
  const healthInsurance = roundCurrency(grossIncome * SK_HEALTH_EMPLOYEE_RATE);
  const preAllowanceBase = roundCurrency(
    Math.max(0, grossIncome - socialInsurance - healthInsurance),
  );
  const nonTaxableAllowance = roundCurrency(
    calculateSlovakAllowance(preAllowanceBase),
  );
  const taxableIncome = roundCurrency(
    Math.max(0, preAllowanceBase - nonTaxableAllowance),
  );
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    SK_PIT_BRACKETS_2026,
  );

  const taxes: SKTaxBreakdown = {
    type: "SK",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance,
    healthInsurance,
  };
  const totalTax = incomeTax + socialInsurance + healthInsurance;
  const totalDeductions = totalTax;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: SKBreakdown = {
    type: "SK",
    grossIncome,
    socialInsurance: {
      rate: SK_SOCIAL_EMPLOYEE_RATE,
      base: socialBase,
      employee: socialInsurance,
      annualCap: SK_SOCIAL_ANNUAL_CAP,
    },
    healthInsurance: {
      rate: SK_HEALTH_EMPLOYEE_RATE,
      employee: healthInsurance,
    },
    preAllowanceBase,
    nonTaxableAllowance,
    taxableIncome,
    bracketTaxes,
    incomeTax: {
      total: incomeTax,
    },
    assumptions: [
      "Employee social insurance 9.4% on gross capped at EUR 16,764/month annualized.",
      "Employee health insurance 5% on gross with no cap.",
      "Progressive PIT on gross minus social, health, and EUR 5,966.73 NCZD when pre-allowance base is at or below EUR 43,983.32.",
      "No voluntary tax-reducing salary contributions modeled.",
    ],
    sourceUrls: Object.values(SK_SOURCE_URLS),
  };

  return {
    country: "SK",
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

export const SKCalculator: CountryCalculator = {
  countryCode: "SK",
  config: SK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SK") {
      throw new Error("SKCalculator can only calculate SK inputs");
    }
    return calculateSK(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): SKCalculatorInputs {
    return {
      country: "SK",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
