import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateProgressiveTax, getPeriodsPerYear } from "../nordic-shared";
import { roundCurrency } from "../calculator-utils";
import { DO_CONFIG } from "./config";
import {
  DO_ISR_BRACKETS_2026,
  DO_ISR_EXEMPT_2026,
  DO_SOURCE_URLS,
  DO_TSS_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { DOBreakdown, DOCalculatorInputs, DOTaxBreakdown } from "./types";

export function calculateDO(inputs: DOCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const tssEmployee = roundCurrency(grossIncome * DO_TSS_EMPLOYEE_RATE);
  const incomeAfterTss = Math.max(0, grossIncome - tssEmployee);
  const progressive = calculateProgressiveTax(incomeAfterTss, DO_ISR_BRACKETS_2026);
  const incomeTax = progressive.tax;
  const taxableIncome = Math.max(0, incomeAfterTss - DO_ISR_EXEMPT_2026);

  const taxes: DOTaxBreakdown = {
    type: "DO",
    totalIncomeTax: incomeTax,
    incomeTax,
    tssEmployee,
  };
  const totalTax = roundCurrency(incomeTax + tssEmployee);
  const netSalary = grossIncome - totalTax;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: DOBreakdown = {
    type: "DO",
    grossIncome,
    tssEmployee,
    isrExemption: DO_ISR_EXEMPT_2026,
    taxableIncome,
    bracketTaxes: progressive.details,
    incomeTax: { total: incomeTax },
    assumptions: [
      "TSS employee 5.91% (AFP 2.87% + SFS 3.04%) on gross.",
      "ISR on salary after TSS with DOP 416,220 exempt, then 15%/20%/25% brackets.",
      "Excludes other deductions, aguinaldo, and employer TSS.",
    ],
    sourceUrls: Object.values(DO_SOURCE_URLS),
  };

  return {
    country: "DO",
    currency: "DOP",
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

export const DOCalculator: CountryCalculator = {
  countryCode: "DO",
  config: DO_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "DO") {
      throw new Error("DOCalculator can only calculate DO inputs");
    }
    return calculateDO(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {};
  },

  getDefaultInputs(): DOCalculatorInputs {
    return {
      country: "DO",
      grossSalary: 720_000,
      payFrequency: "monthly",
      contributions: {},
    };
  },
};
