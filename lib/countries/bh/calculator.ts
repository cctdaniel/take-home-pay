import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { BH_CONFIG } from "./config";
import {
  BH_EXPAT_UNEMPLOYMENT_RATE,
  BH_NATIONAL_SOCIAL_EMPLOYEE_RATE,
  BH_PERSONAL_INCOME_TAX_RATE,
  BH_SOCIAL_ANNUAL_CAP,
  BH_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { BHBreakdown, BHCalculatorInputs, BHTaxBreakdown } from "./types";

export function calculateBH(inputs: BHCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const isNational = inputs.nationality === "bahraini_national";
  const contributionBase = Math.min(grossIncome, BH_SOCIAL_ANNUAL_CAP);
  const socialInsuranceEmployee = roundCurrency(
    isNational
      ? contributionBase * BH_NATIONAL_SOCIAL_EMPLOYEE_RATE
      : contributionBase * BH_EXPAT_UNEMPLOYMENT_RATE,
  );
  const incomeTax = 0;

  const taxes: BHTaxBreakdown = {
    type: "BH",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsuranceEmployee,
  };
  const totalTax = socialInsuranceEmployee;
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: BHBreakdown = {
    type: "BH",
    grossIncome,
    nationality: inputs.nationality,
    contributionBase,
    incomeTaxRate: BH_PERSONAL_INCOME_TAX_RATE,
    socialInsurance: {
      employeeRate: isNational
        ? BH_NATIONAL_SOCIAL_EMPLOYEE_RATE
        : BH_EXPAT_UNEMPLOYMENT_RATE,
      employee: socialInsuranceEmployee,
    },
    assumptions: [
      "No personal income tax on employment salary.",
      "Bahraini nationals: 8% SIO employee on gross capped at BHD 4,000/month.",
      "Expatriates: 1% unemployment insurance on the same capped base.",
      "Excludes end-of-service indemnity and employer-only contributions.",
    ],
    sourceUrls: Object.values(BH_SOURCE_URLS),
  };

  return {
    country: "BH",
    currency: "BHD",
    grossSalary: grossIncome,
    taxableIncome: 0,
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

export const BHCalculator: CountryCalculator = {
  countryCode: "BH",
  config: BH_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "BH") {
      throw new Error("BHCalculator can only calculate BH inputs");
    }
    return calculateBH(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): BHCalculatorInputs {
    return {
      country: "BH",
      grossSalary: 24_000,
      payFrequency: "monthly",
      nationality: "expatriate",
      contributions: {},
    };
  },
};
