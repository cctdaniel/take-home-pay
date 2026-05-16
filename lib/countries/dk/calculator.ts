import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { DK_CONFIG } from "./config";
import { DK_TAX_CONFIG } from "./constants/tax-year-2026";
import type { DKBreakdown, DKCalculatorInputs, DKTaxBreakdown } from "./types";

export function calculateDK(inputs: DKCalculatorInputs): CalculationResult {
  const computation = calculateNordicTax(inputs.grossSalary, DK_TAX_CONFIG);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - computation.totalTax);

  const taxes: DKTaxBreakdown = {
    type: "DK",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: DKBreakdown = {
    type: "DK",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: DK_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: DK_TAX_CONFIG.employeeSocialRate,
      cap: DK_TAX_CONFIG.employeeSocialCap,
    },
    standardDeduction: DK_TAX_CONFIG.standardDeduction,
    assumptions: DK_TAX_CONFIG.assumptions,
    sourceUrls: DK_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "DK",
  const employeeSocialBase = grossSalary - employeeSocialContribution;
  const taxableIncome = Math.max(0, employeeSocialBase - standardDeduction);
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

export const DKCalculator: CountryCalculator = {
  countryCode: "DK",
  config: DK_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "DK") {
      throw new Error("DKCalculator can only calculate DK inputs");
    }

    return calculateDK(inputs as DKCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): DKCalculatorInputs {
    return {
      country: "DK",
      grossSalary: 600_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
