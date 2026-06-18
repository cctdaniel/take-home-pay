import { clampAmount } from "@/lib/utils";
import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { AL_CONFIG } from "./config";
import {
  AL_PERSONAL_DEDUCTION_2026,
  AL_PIT_BRACKETS_2026,
  AL_SOCIAL_ANNUAL_CAP,
  AL_SOCIAL_EMPLOYEE_RATE,
  AL_SOURCE_URLS,
  AL_VOLUNTARY_PENSION_ANNUAL_CAP,
} from "./constants/tax-year-2026";
import type { ALBreakdown, ALCalculatorInputs, ALTaxBreakdown } from "./types";

export function calculateAL(inputs: ALCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialBase = Math.min(grossIncome, AL_SOCIAL_ANNUAL_CAP);
  const socialInsurance = roundCurrency(socialBase * AL_SOCIAL_EMPLOYEE_RATE);
  const voluntaryPension = clampAmount(
    inputs.contributions?.voluntaryPension,
    AL_VOLUNTARY_PENSION_ANNUAL_CAP,
  );
  const taxableIncome = Math.max(
    0,
    grossIncome - socialInsurance - AL_PERSONAL_DEDUCTION_2026 - voluntaryPension,
  );
  const progressive = calculateProgressiveTax(taxableIncome, AL_PIT_BRACKETS_2026);
  const incomeTax = progressive.tax;

  const taxes: ALTaxBreakdown = {
    type: "AL",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance,
  };
  const totalTax = roundCurrency(incomeTax + socialInsurance);
  const totalDeductions = roundCurrency(totalTax + voluntaryPension);
  const netSalary = grossIncome - totalDeductions;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: ALBreakdown = {
    type: "AL",
    grossIncome,
    socialInsurance,
    personalDeduction: AL_PERSONAL_DEDUCTION_2026,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    voluntaryContributions: {
      voluntaryPension,
      voluntaryPensionLimit: AL_VOLUNTARY_PENSION_ANNUAL_CAP,
      total: voluntaryPension,
    },
    assumptions: [
      "Employee social insurance 11.2% (9.5% + 1.7%) capped at ALL 186,416/month.",
      "Personal deduction ALL 360,000 and voluntary private pension up to ALL 480,000 reduce PIT base.",
      "Progressive PIT 13% up to ALL 2,040,000 taxable, 23% above.",
      "Excludes employer contributions and self-employed regimes.",
    ],
    sourceUrls: Object.values(AL_SOURCE_URLS),
  };

  return {
    country: "AL",
    currency: "ALL",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
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

export const ALCalculator: CountryCalculator = {
  countryCode: "AL",
  config: AL_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "AL") {
      throw new Error("ALCalculator can only calculate AL inputs");
    }
    return calculateAL(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      voluntaryPension: {
        limit: AL_VOLUNTARY_PENSION_ANNUAL_CAP,
        name: "Private voluntary pension",
        description:
          "Contributions to approved private pension funds deductible up to ALL 480,000 per year (national minimum wage cap).",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ALCalculatorInputs {
    return {
      country: "AL",
      grossSalary: 1_800_000,
      payFrequency: "monthly",
      contributions: { voluntaryPension: 0 },
    };
  },
};
