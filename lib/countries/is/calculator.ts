import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { IS_CONFIG } from "./config";
import { IS_TAX_CONFIG } from "./constants/tax-year-2026";
import type { ISBreakdown, ISCalculatorInputs, ISTaxBreakdown } from "./types";

export function calculateIS(inputs: ISCalculatorInputs): CalculationResult {
  const computation = calculateNordicTax(inputs.grossSalary, IS_TAX_CONFIG);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - computation.totalTax);

  const taxes: ISTaxBreakdown = {
    type: "IS",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: ISBreakdown = {
    type: "IS",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: IS_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: IS_TAX_CONFIG.employeeSocialRate,
      cap: IS_TAX_CONFIG.employeeSocialCap,
    },
    standardDeduction: IS_TAX_CONFIG.standardDeduction,
    assumptions: IS_TAX_CONFIG.assumptions,
    sourceUrls: IS_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "IS",
  const taxableIncome = Math.max(
    0,
    grossSalary - employeeSocialContribution - standardDeduction,
  );
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

export const ISCalculator: CountryCalculator = {
  countryCode: "IS",
  config: IS_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IS") {
      throw new Error("ISCalculator can only calculate IS inputs");
    }

    return calculateIS(inputs as ISCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): ISCalculatorInputs {
    return {
      country: "IS",
      grossSalary: 9_600_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
