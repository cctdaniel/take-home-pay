import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { BZ_CONFIG } from "./config";
import {
  BZ_PIT_EXEMPTION_2026,
  BZ_PIT_RATE,
  BZ_SOCIAL_ANNUAL_CEILING,
  BZ_SOCIAL_EMPLOYEE_ANNUAL_MAX,
  BZ_SOCIAL_EMPLOYEE_RATE,
  BZ_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { BZBreakdown, BZCalculatorInputs, BZTaxBreakdown } from "./types";

export function calculateBZ(inputs: BZCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, BZ_SOCIAL_ANNUAL_CEILING);
  const socialSecurity = roundCurrency(
    Math.min(socialBase * BZ_SOCIAL_EMPLOYEE_RATE, BZ_SOCIAL_EMPLOYEE_ANNUAL_MAX),
  );
  const taxableIncome = Math.max(0, grossIncome - BZ_PIT_EXEMPTION_2026);
  const incomeTax = roundCurrency(taxableIncome * BZ_PIT_RATE);

  const taxes: BZTaxBreakdown = {
    type: "BZ",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = roundCurrency(incomeTax + socialSecurity);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: BZBreakdown = {
    type: "BZ",
    grossIncome,
    socialSecurity,
    pitExemption: BZ_PIT_EXEMPTION_2026,
    taxableIncome,
    incomeTax: { total: incomeTax, rate: BZ_PIT_RATE },
    assumptions: [
      "Employee social security ~4.5% on insurable earnings capped at BZD 520/week.",
      "Maximum employee social contribution about BZD 1,217/year at the ceiling.",
      "PIT 25% flat on annual gross above BZD 29,000 exemption.",
      "Excludes business tax, GST, and QRP special regimes.",
    ],
    sourceUrls: Object.values(BZ_SOURCE_URLS),
  };

  return {
    country: "BZ",
    currency: "BZD",
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

export const BZCalculator: CountryCalculator = {
  countryCode: "BZ",
  config: BZ_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BZ") {
      throw new Error("BZCalculator can only calculate BZ inputs");
    }
    return calculateBZ(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): BZCalculatorInputs {
    return {
      country: "BZ",
      grossSalary: 60_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
