import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { FI_CONFIG } from "./config";
import { FI_TAX_CONFIG } from "./constants/tax-year-2026";
import type { FIBreakdown, FICalculatorInputs, FITaxBreakdown } from "./types";

export function calculateFI(inputs: FICalculatorInputs): CalculationResult {
  const computation = calculateNordicTax(inputs.grossSalary, FI_TAX_CONFIG);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - computation.totalTax);

  const taxes: FITaxBreakdown = {
    type: "FI",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: FIBreakdown = {
    type: "FI",
    grossIncome: inputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: FI_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: FI_TAX_CONFIG.employeeSocialRate,
      cap: FI_TAX_CONFIG.employeeSocialCap,
    },
    standardDeduction: FI_TAX_CONFIG.standardDeduction,
    assumptions: FI_TAX_CONFIG.assumptions,
    sourceUrls: FI_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "FI",
    currency: "EUR",
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

export const FICalculator: CountryCalculator = {
  countryCode: "FI",
  config: FI_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "FI") {
      throw new Error("FICalculator can only calculate FI inputs");
    }

    return calculateFI(inputs as FICalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): FICalculatorInputs {
    return {
      country: "FI",
      grossSalary: 60_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
