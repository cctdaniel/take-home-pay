import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax } from "../nordic-shared";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";
import { LT_CONFIG } from "./config";
import {
  LT_GPM_BRACKETS_2026,
  LT_SOURCE_URLS,
  LT_VSD_ANNUAL_CAP,
  LT_VSD_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { LTBreakdown, LTCalculatorInputs, LTTaxBreakdown } from "./types";

export function calculateLT(inputs: LTCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const vsdBase = Math.min(grossIncome, LT_VSD_ANNUAL_CAP);
  const vsdEmployee = roundCurrency(vsdBase * LT_VSD_EMPLOYEE_RATE);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome - vsdEmployee));
  const { tax: incomeTax, details: bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    LT_GPM_BRACKETS_2026,
  );

  const taxes: LTTaxBreakdown = {
    type: "LT",
    totalIncomeTax: incomeTax,
    incomeTax,
    vsdEmployee,
  };
  const totalTax = incomeTax + vsdEmployee;
  const totalDeductions = totalTax;
  const netSalary = roundCurrency(grossIncome - totalDeductions);
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: LTBreakdown = {
    type: "LT",
    grossIncome,
    vsd: {
      rate: LT_VSD_EMPLOYEE_RATE,
      base: vsdBase,
      employee: vsdEmployee,
      annualCap: LT_VSD_ANNUAL_CAP,
    },
    taxableIncome,
    bracketTaxes,
    incomeTax: {
      total: incomeTax,
    },
    assumptions: [
      "Employee VSD social insurance 19.5% on gross capped at EUR 138,729 annually.",
      "Progressive GPM on gross minus employee VSD: 20% / 25% / 32%.",
      "No voluntary tax-reducing salary contributions modeled.",
    ],
    sourceUrls: Object.values(LT_SOURCE_URLS),
  };

  return {
    country: "LT",
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

export const LTCalculator: CountryCalculator = {
  countryCode: "LT",
  config: LT_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "LT") {
      throw new Error("LTCalculator can only calculate LT inputs");
    }
    return calculateLT(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): LTCalculatorInputs {
    return {
      country: "LT",
      grossSalary: 36_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
