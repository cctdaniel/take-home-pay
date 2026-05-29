import { clampAmount } from "@/lib/utils";
import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { LV_CONFIG } from "./config";
import {
  LV_NTA_ANNUAL,
  LV_PIT_BRACKETS_2026,
  LV_PRIVATE_PENSION_ANNUAL_CAP_2026,
  LV_PRIVATE_PENSION_RATE_OF_GROSS,
  LV_SOURCE_URLS,
  LV_SS_ANNUAL_CAP,
  LV_SS_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { LVBreakdown, LVCalculatorInputs, LVTaxBreakdown } from "./types";

export function calculateLV(inputs: LVCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const privatePensionLimit = Math.min(
    LV_PRIVATE_PENSION_ANNUAL_CAP_2026,
    grossIncome * LV_PRIVATE_PENSION_RATE_OF_GROSS,
  );
  const privatePension = clampAmount(
    inputs.contributions?.privatePension,
    privatePensionLimit,
  );
  const ssBase = Math.min(grossIncome, LV_SS_ANNUAL_CAP);
  const socialSecurity = roundCurrency(ssBase * LV_SS_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - socialSecurity - LV_NTA_ANNUAL - privatePension),
  );
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    LV_PIT_BRACKETS_2026,
  );

  const taxes: LVTaxBreakdown = {
    type: "LV",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity,
  };
  const totalTax = incomeTax + socialSecurity;
  const totalDeductions = totalTax + privatePension;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: LVBreakdown = {
    type: "LV",
    grossIncome,
    socialSecurity: {
      rate: LV_SS_EMPLOYEE_RATE,
      base: ssBase,
      employee: socialSecurity,
      annualCap: LV_SS_ANNUAL_CAP,
    },
    nonTaxableMinimum: LV_NTA_ANNUAL,
    taxableIncome,
    bracketTaxes,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      privatePension,
      privatePensionLimit,
      total: privatePension,
    },
    assumptions: [
      "Employee social security 10.5% on gross capped at EUR 105,300 annually.",
      "EUR 6,600 non-taxable minimum (NTA) deducted before PIT.",
      "Progressive PIT at 25.5% up to EUR 105,300 taxable and 33% above.",
      "Private pension up to EUR 4,000 and 10% of gross reduces taxable income. salary contributions modeled.",
    ],
    sourceUrls: Object.values(LV_SOURCE_URLS),
  };

  return {
    country: "LV",
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

export const LVCalculator: CountryCalculator = {
  countryCode: "LV",
  config: LV_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "LV") {
      throw new Error("LVCalculator can only calculate LV inputs");
    }
    return calculateLV(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const gross = Math.max(0, (inputs as LVCalculatorInputs | undefined)?.grossSalary ?? 36_000);
    const limit = Math.min(LV_PRIVATE_PENSION_ANNUAL_CAP_2026, gross * LV_PRIVATE_PENSION_RATE_OF_GROSS);
    return {
      privatePension: {
        limit,
        name: "Private pension fund",
        description: "Deductible up to EUR 4,000 and 10% of annual gross income.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): LVCalculatorInputs {
    return {
      country: "LV",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: { privatePension: 0 },
    };
  },
};
