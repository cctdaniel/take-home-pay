import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { SE_CONFIG } from "./config";
import { SE_TAX_CONFIG } from "./constants/tax-year-2026";
import type { SEBreakdown, SECalculatorInputs, SETaxBreakdown } from "./types";

export function calculateSE(inputs: SECalculatorInputs): CalculationResult {
  const computation = calculateNordicTax(inputs.grossSalary, SE_TAX_CONFIG);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - computation.totalTax);

  const taxes: SETaxBreakdown = {
    type: "SE",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
    employeeSocialTaxCredit: computation.employeeSocialTaxCredit,
  };

  const breakdown: SEBreakdown = {
    type: "SE",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: SE_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: SE_TAX_CONFIG.employeeSocialRate,
      cap: SE_TAX_CONFIG.employeeSocialContributionCap,
    },
    employeeSocialTaxCredit: computation.employeeSocialTaxCredit,
    standardDeduction: SE_TAX_CONFIG.standardDeduction,
    assumptions: SE_TAX_CONFIG.assumptions,
    sourceUrls: SE_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "SE",
    currency: "SEK",
    grossSalary: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions: computation.totalTax,
    netSalary,
    effectiveTaxRate: inputs.grossSalary > 0 ? computation.totalTax / inputs.grossSalary : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const SECalculator: CountryCalculator = {
  countryCode: "SE",
  config: SE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SE") {
      throw new Error("SECalculator can only calculate SE inputs");
    }

    return calculateSE(inputs as SECalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): SECalculatorInputs {
    return {
      country: "SE",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
