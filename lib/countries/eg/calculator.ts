import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { EG_CONFIG } from "./config";
import {
  EG_PERSONAL_EXEMPTION_2026,
  EG_PIT_BRACKETS_2026,
  EG_SOCIAL_INSURANCE_2026,
  EG_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { EGBreakdown, EGCalculatorInputs, EGTaxBreakdown } from "./types";
import { roundCurrency } from "../calculator-utils";

export function calculateEG(inputs: EGCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, EG_SOCIAL_INSURANCE_2026.annualSalaryCap);
  const socialInsurance = roundCurrency(
    socialBase * EG_SOCIAL_INSURANCE_2026.employeeRate,
  );
  const incomeAfterSocial = Math.max(0, grossIncome - socialInsurance);
  const taxableIncome = Math.max(
    0,
    incomeAfterSocial - EG_PERSONAL_EXEMPTION_2026,
  );
  const progressive = calculateProgressiveTax(taxableIncome, EG_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: EGTaxBreakdown = {
    type: "EG",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance,
  };
  const totalTax = roundCurrency(incomeTax + socialInsurance);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: EGBreakdown = {
    type: "EG",
    grossIncome,
    socialInsurance,
    personalExemption: EG_PERSONAL_EXEMPTION_2026,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "Employee social insurance 11% on gross capped at EGP 16,700/month.",
      "Personal exemption EGP 20,000 applied before progressive salary tax.",
      "High-earner bracket elimination rule excluded for simplicity.",
      "Excludes solidarity levy, Zakat, and sector-specific exemptions.",
    ],
    sourceUrls: Object.values(EG_SOURCE_URLS),
  };

  return {
    country: "EG",
    currency: "EGP",
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

export const EGCalculator: CountryCalculator = {
  countryCode: "EG",
  config: EG_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "EG") {
      throw new Error("EGCalculator can only calculate EG inputs");
    }
    return calculateEG(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): EGCalculatorInputs {
    return {
      country: "EG",
      grossSalary: 300_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
