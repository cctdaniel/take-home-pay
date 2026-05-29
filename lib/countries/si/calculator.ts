import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { SI_CONFIG } from "./config";
import {
  SI_PIT_BRACKETS_2026,
  SI_SOCIAL_EMPLOYEE_RATE,
  SI_SOURCE_URLS,
} from "./constants/tax-year-2026";
import type { SIBreakdown, SICalculatorInputs, SITaxBreakdown } from "./types";

export function calculateSI(inputs: SICalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const socialInsurance = roundCurrency(grossIncome * SI_SOCIAL_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - socialInsurance));
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    SI_PIT_BRACKETS_2026,
  );

  const taxes: SITaxBreakdown = {
    type: "SI",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialInsurance,
  };
  const totalTax = incomeTax + socialInsurance;
  const totalDeductions = totalTax;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: SIBreakdown = {
    type: "SI",
    grossIncome,
    socialInsurance: {
      rate: SI_SOCIAL_EMPLOYEE_RATE,
      employee: socialInsurance,
    },
    taxableIncome,
    bracketTaxes,
    incomeTax: {
      total: incomeTax,
    },
    assumptions: [
      "Employee social contributions modeled at 22.1% of gross salary.",
      "Progressive PIT on gross minus employee social: 16% / 26% / 33% / 39% / 50%.",
      "No voluntary tax-reducing salary contributions modeled.",
    ],
    sourceUrls: Object.values(SI_SOURCE_URLS),
  };

  return {
    country: "SI",
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

export const SICalculator: CountryCalculator = {
  countryCode: "SI",
  config: SI_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SI") {
      throw new Error("SICalculator can only calculate SI inputs");
    }
    return calculateSI(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): SICalculatorInputs {
    return {
      country: "SI",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
