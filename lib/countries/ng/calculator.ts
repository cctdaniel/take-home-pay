import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { NG_CONFIG } from "./config";
import {
  NG_PAYE_BRACKETS_2026,
  NG_PENSION_2026,
  NG_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { NGBreakdown, NGCalculatorInputs, NGTaxBreakdown } from "./types";
import { roundCurrency } from "../calculator-utils";

export function calculateNG(inputs: NGCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const pension = roundCurrency(grossIncome * NG_PENSION_2026.employeeRate);
  const chargeableIncome = Math.max(0, grossIncome - pension);
  const progressive = calculateProgressiveTax(chargeableIncome, NG_PAYE_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: NGTaxBreakdown = {
    type: "NG",
    totalIncomeTax: incomeTax,
    incomeTax,
    pension,
  };
  const totalTax = roundCurrency(incomeTax + pension);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: NGBreakdown = {
    type: "NG",
    grossIncome,
    pension,
    chargeableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "Mandatory employee pension 8% of gross deducted before PAYE.",
      "NTA 2025 Fourth Schedule PAYE brackets on chargeable income.",
      "Voluntary AVC or additional pension top-ups not modeled.",
      "Excludes NHF, NSITF, state levies, and consolidated relief allowance.",
    ],
    sourceUrls: Object.values(NG_SOURCE_URLS),
  };

  return {
    country: "NG",
    currency: "NGN",
    grossSalary: grossIncome,
    taxableIncome: chargeableIncome,
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

export const NGCalculator: CountryCalculator = {
  countryCode: "NG",
  config: NG_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NG") {
      throw new Error("NGCalculator can only calculate NG inputs");
    }
    return calculateNG(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): NGCalculatorInputs {
    return {
      country: "NG",
      grossSalary: 7_200_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
