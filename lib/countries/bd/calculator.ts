import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { BD_CONFIG } from "./config";
import { BD_PIT_BRACKETS_FY2026, BD_SOURCE_URLS } from "./constants/tax-year-2026";
import type { BDBreakdown, BDCalculatorInputs, BDTaxBreakdown } from "./types";

export function calculateBD(inputs: BDCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const taxableIncome = grossIncome;
  const progressive = calculateProgressiveTax(taxableIncome, BD_PIT_BRACKETS_FY2026);
  const incomeTax = progressive.tax;

  const taxes: BDTaxBreakdown = {
    type: "BD",
    totalIncomeTax: incomeTax,
    incomeTax,
  };
  const totalTax = incomeTax;
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: BDBreakdown = {
    type: "BD",
    grossIncome,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "FY 2026-27 progressive salary tax slabs on gross employment income.",
      "No employee social insurance deduction modeled for salaried employees.",
      "Excludes investment rebates, house rent allowance exemptions, and sector benefits.",
    ],
    sourceUrls: Object.values(BD_SOURCE_URLS),
  };

  return {
    country: "BD",
    currency: "BDT",
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

export const BDCalculator: CountryCalculator = {
  countryCode: "BD",
  config: BD_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BD") {
      throw new Error("BDCalculator can only calculate BD inputs");
    }
    return calculateBD(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): BDCalculatorInputs {
    return {
      country: "BD",
      grossSalary: 1_200_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
